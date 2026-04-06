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
)

func main() {
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
	r := gin.Default()

	// CORS configuration for frontend
	corsConfig := cors.DefaultConfig()
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL != "" {
		// Production: use specific frontend URL
		corsConfig.AllowOrigins = strings.Split(frontendURL, ",")
	} else {
		// Development: allow localhost
		corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001"}
	}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(corsConfig))

	// Clerk webhook endpoint (no auth middleware - uses svix signature verification)
	r.POST("/auth/webhooks/clerk", auth.ClerkWebhook)

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
