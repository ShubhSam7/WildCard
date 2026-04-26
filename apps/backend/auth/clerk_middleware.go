package auth

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"iiitn-predict/packages/database"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// ClerkJWKS represents Clerk's JSON Web Key Set
type ClerkJWKS struct {
	Keys []ClerkJWK `json:"keys"`
}

// ClerkJWK represents a single JSON Web Key
type ClerkJWK struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

var (
	clerkJWKS     *ClerkJWKS
	jwksLastFetch time.Time
)

func normalizeClerkDomain(value string) string {
	domain := strings.TrimSpace(value)
	domain = strings.TrimPrefix(domain, "https://")
	domain = strings.TrimPrefix(domain, "http://")
	domain = strings.TrimSuffix(domain, "/")

	if idx := strings.Index(domain, "/"); idx != -1 {
		domain = domain[:idx]
	}

	return domain
}

// fetchClerkJWKS fetches and caches Clerk's public keys
func fetchClerkJWKS() (*ClerkJWKS, error) {
	// Cache JWKS for 1 hour
	if clerkJWKS != nil && time.Since(jwksLastFetch) < time.Hour {
		return clerkJWKS, nil
	}

	clerkDomain := normalizeClerkDomain(os.Getenv("CLERK_DOMAIN"))
	if clerkDomain == "" {
		clerkDomain = "clerk.dev" // Default for development
	}

	jwksURL := fmt.Sprintf("https://%s/.well-known/jwks.json", clerkDomain)
	resp, err := http.Get(jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch JWKS: status %d", resp.StatusCode)
	}

	var jwks ClerkJWKS
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS: %w", err)
	}

	clerkJWKS = &jwks
	jwksLastFetch = time.Now()
	return clerkJWKS, nil
}

// getPublicKey retrieves the RSA public key for a given kid
func getPublicKey(kid string) (*rsa.PublicKey, error) {
	jwks, err := fetchClerkJWKS()
	if err != nil {
		return nil, err
	}

	for _, key := range jwks.Keys {
		if key.Kid == kid {
			return convertJWKToPublicKey(key)
		}
	}

	return nil, errors.New("key not found")
}

// convertJWKToPublicKey converts a JWK to an RSA public key
func convertJWKToPublicKey(jwk ClerkJWK) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(jwk.N)
	if err != nil {
		return nil, fmt.Errorf("failed to decode N: %w", err)
	}

	eBytes, err := base64.RawURLEncoding.DecodeString(jwk.E)
	if err != nil {
		return nil, fmt.Errorf("failed to decode E: %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	e := new(big.Int).SetBytes(eBytes).Int64()

	return &rsa.PublicKey{
		N: n,
		E: int(e),
	}, nil
}

func authenticateClerkRequest(c *gin.Context) (*database.User, bool) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		c.Abort()
		return nil, false
	}

	// Remove "Bearer " prefix if present
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	// Parse token to get the kid from header
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Get kid from header
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("kid not found in token header")
		}

		// Get public key for this kid
		return getPublicKey(kid)
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
		c.Abort()
		return nil, false
	}

	if !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort()
		return nil, false
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		c.Abort()
		return nil, false
	}

	// Extract Clerk user ID (sub claim)
	clerkUserID, ok := claims["sub"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		c.Abort()
		return nil, false
	}
	email := ""
	if claimEmail, ok := claims["email"].(string); ok {
		email = database.NormalizeEmail(claimEmail)
	}
	adminEmail := database.AdminEmail()

	var user database.User
	if err := database.DB.Where("clerk_id = ?", clerkUserID).First(&user).Error; err != nil {
		if email == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return nil, false
		}

		if err := database.DB.Unscoped().Where("LOWER(email) = ?", email).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return nil, false
		}

		updates := map[string]interface{}{"clerk_id": clerkUserID}
		if adminEmail != "" && email == adminEmail {
			updates["role"] = database.RoleTypeAdmin
		}
		if err := database.DB.Unscoped().Model(&user).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link user"})
			c.Abort()
			return nil, false
		}
		if err := database.DB.Where("clerk_id = ?", clerkUserID).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return nil, false
		}
	}

	log.Printf("[ClerkAuth] User found: id=%d, email=%q, role=%q, adminEmail=%q, normalized=%q",
		user.ID, user.Email, user.Role, adminEmail, database.NormalizeEmail(user.Email))

	if adminEmail != "" && database.NormalizeEmail(user.Email) == adminEmail && user.Role != database.RoleTypeAdmin {
		log.Printf("[ClerkAuth] Promoting user %d to ADMIN (email match)", user.ID)
		if err := database.DB.Model(&user).Update("role", database.RoleTypeAdmin).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
			c.Abort()
			return nil, false
		}
		user.Role = database.RoleTypeAdmin
	}

	c.Set("clerk_user_id", clerkUserID)
	c.Set("user_id", user.ID)
	c.Set("user_role", user.Role)

	// Optional: Store other useful claims
	if email != "" {
		c.Set("user_email", email)
	}

	return &user, true
}

// ClerkMiddleware validates Clerk JWT tokens
func ClerkMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if _, ok := authenticateClerkRequest(c); !ok {
			return
		}

		c.Next()
	}
}

// ClerkAdminMiddleware validates Clerk JWT tokens and checks for admin role
func ClerkAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, ok := authenticateClerkRequest(c)
		if !ok {
			return
		}

		if user.Role != database.RoleTypeAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// Helper function to get Clerk user ID from context
func GetClerkUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("clerk_user_id")
	if !exists {
		return "", false
	}

	clerkID, ok := userID.(string)
	return clerkID, ok
}
