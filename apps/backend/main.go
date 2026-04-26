package main

import (
	"context"
	"iiitn-predict/apps/backend/auth"
	"iiitn-predict/apps/backend/bet"
	"iiitn-predict/packages/database"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env for local development (silently ignored in production)
	_ = godotenv.Load("../../.env")

	// Set Gin to release mode for production (can be overridden by GIN_MODE env var)
	if os.Getenv("GIN_MODE") == "" && os.Getenv("PORT") != "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Validate required environment variables
	requiredEnvVars := []string{"DATABASE_URL", "CLERK_WEBHOOK_SECRET", "CLERK_DOMAIN"}
	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			panic("Required environment variable " + envVar + " is not set")
		}
	}

	database.InitDB()
	// database.SeedAdmin()
	r := gin.Default()

	// CORS configuration for frontend
	corsConfig := cors.DefaultConfig()
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL != "" {
		// Production: use explicit comma-separated frontend URLs.
		origins := strings.Split(frontendURL, ",")
		allowOrigins := make([]string, 0, len(origins))
		for _, origin := range origins {
			trimmed := strings.TrimSpace(origin)
			if trimmed != "" {
				allowOrigins = append(allowOrigins, trimmed)
			}
		}
		if len(allowOrigins) > 0 {
			corsConfig.AllowOrigins = allowOrigins
		} else {
			// Safety fallback when FRONTEND_URL exists but is empty/malformed.
			corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001"}
		}
	} else {
		// Development: allow localhost
		corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001"}
	}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(corsConfig))

	// Clerk webhook endpoint (no auth middleware - uses svix signature verification)
	r.POST("/auth/webhooks/clerk", auth.ClerkWebhook)

	// Public endpoints
	r.GET("/bet/markets", bet.GetMarkets)
	r.GET("/leaderboard", bet.GetLeaderboard)

	// Authenticated user endpoints
	userGroup := r.Group("/user")
	userGroup.Use(auth.ClerkMiddleware())
	{
		userGroup.GET("/balance", bet.GetUserBalance)
		userGroup.GET("/stats", bet.GetUserStats)
		userGroup.GET("/portfolio", bet.GetUserPortfolio)
	}

	betGroup := r.Group("/bet")
	betGroup.Use(auth.ClerkMiddleware()) // Clerk auth middleware to protect the routes
	{
		betGroup.POST("/place", bet.PlaceBet)             // place a bet
		betGroup.POST("/discussion", bet.DiscussionOnBet) // discussion on a bet
	}

	betCreate := r.Group("/bet")
	betCreate.Use(auth.ClerkAdminMiddleware())
	{
		betCreate.POST("/create", bet.CreateBet) // create a bet
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "WildCard backend is live!",
		})
	})

	// Health check endpoint for Render monitoring
	r.GET("/health", func(c *gin.Context) {
		// Check database connection
		sqlDB, err := database.DB.DB()
		if err != nil {
			c.JSON(503, gin.H{
				"status": "unhealthy",
				"error":  "database connection error",
			})
			return
		}

		if err := sqlDB.Ping(); err != nil {
			c.JSON(503, gin.H{
				"status": "unhealthy",
				"error":  "database ping failed",
			})
			return
		}

		c.JSON(200, gin.H{
			"status":   "healthy",
			"database": "connected",
		})
	})

	// Get port from environment variable (Render sets this automatically)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default for local development
	}

	// Create HTTP server for graceful shutdown
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Gracefully shutdown with a 5-second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	// Close database connection
	sqlDB, err := database.DB.DB()
	if err == nil {
		sqlDB.Close()
	}

	log.Println("Server exited")
}
