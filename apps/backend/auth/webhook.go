package auth

import (
	"encoding/json"
	"fmt"
	"iiitn-predict/packages/database"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	svix "github.com/svix/svix-webhooks/go"
)

type ClerkWebhookEvent struct {
	Type string          `json:"type"`
	Data ClerkUserData   `json:"data"`
}

type ClerkUserData struct {
	ID                string                 `json:"id"`
	FirstName         string                 `json:"first_name"`
	LastName          string                 `json:"last_name"`
	EmailAddresses    []ClerkEmailAddress    `json:"email_addresses"`
	ProfileImageURL   string                 `json:"profile_image_url"`
	PrimaryEmailID    string                 `json:"primary_email_address_id"`
}

type ClerkEmailAddress struct {
	ID           string `json:"id"`
	EmailAddress string `json:"email_address"`
}

func ClerkWebhook(c *gin.Context) {
	webhookSecret := os.Getenv("CLERK_WEBHOOK_SECRET")
	if webhookSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook secret not configured"})
		return
	}

	// Read the request body
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	// Get headers needed for verification
	headers := http.Header{}
	headers.Set("svix-id", c.GetHeader("svix-id"))
	headers.Set("svix-timestamp", c.GetHeader("svix-timestamp"))
	headers.Set("svix-signature", c.GetHeader("svix-signature"))

	// Create svix webhook instance
	wh, err := svix.NewWebhook(webhookSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize webhook verifier"})
		return
	}

	// Verify the webhook signature
	var event ClerkWebhookEvent
	err = wh.Verify(payload, headers)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
		return
	}

	// Parse the event
	if err := json.Unmarshal(payload, &event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse webhook payload"})
		return
	}

	// Handle user.created event
	if event.Type == "user.created" {
		if err := handleUserCreated(event.Data); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create user: %v", err)})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
		return
	}

	// For other event types, just acknowledge receipt
	c.JSON(http.StatusOK, gin.H{"message": "Webhook received"})
}

// handleUserCreated processes the user.created event and adds user to database
func handleUserCreated(userData ClerkUserData) error {
	// Find primary email
	var email string
	for _, emailAddr := range userData.EmailAddresses {
		if emailAddr.ID == userData.PrimaryEmailID {
			email = emailAddr.EmailAddress
			break
		}
	}

	// If no primary email found, use the first one
	if email == "" && len(userData.EmailAddresses) > 0 {
		email = userData.EmailAddresses[0].EmailAddress
	}

	// Construct full name from first and last name
	name := userData.FirstName
	if userData.LastName != "" {
		if name != "" {
			name += " " + userData.LastName
		} else {
			name = userData.LastName
		}
	}

	// If name is still empty, use email prefix
	if name == "" {
		name = email
	}

	// Create user in database
	user := database.User{
		ClerkID:         userData.ID,
		Name:            name,
		Email:           email,
		ProfileImageUrl: userData.ProfileImageURL,
		WildCoins:       10000.0, // Default starting coins
		Role:            database.RoleTypeStudent,
	}

	// Check if user already exists (idempotency check)
	var existingUser database.User
	if err := database.DB.Where("clerk_id = ?", userData.ID).First(&existingUser).Error; err == nil {
		// User already exists, this is a duplicate webhook
		return nil
	}

	// Create the user
	if err := database.DB.Create(&user).Error; err != nil {
		return fmt.Errorf("failed to insert user into database: %w", err)
	}

	// Optionally: Create a signup bonus transaction
	transaction := database.Transaction{
		UserID:      user.ID,
		Amount:      10000.0,
		Type:        database.TransactionTypeSignupBonus,
		Description: "Welcome to WildCard! Here's your starting coins.",
	}

	if err := database.DB.Create(&transaction).Error; err != nil {
		// Log error but don't fail the webhook - user is already created
		fmt.Printf("Warning: Failed to create signup bonus transaction for user %s: %v\n", user.ClerkID, err)
	}

	return nil
}
