package main

import (
	"iiitn-predict/apps/backend/auth"
	"iiitn-predict/apps/backend/bet"
	"iiitn-predict/packages/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
    database.InitDB()
    database.SeedAdmin()
    r := gin.Default()

    // CORS middleware
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))

    authGroup := r.Group("/auth")
    {
        authGroup.POST("/signup", auth.Signup) // signup the user with 10k coins
        authGroup.POST("/signin", auth.Signin) // signin the user
        authGroup.POST("/admin/login", auth.AdminLogin) //admin login
    }

    betGroup := r.Group("/bet")
    betGroup.Use(auth.Middleware()) // auth middleware to protect the routes
    {
        betGroup.POST("/place", bet.PlaceBet) // place a bet
        betGroup.POST("/discussion", bet.DiscussionOnBet) // discussion on a bet
    }

    betCreate := r.Group("/bet")
    betCreate.Use(auth.AdminMiddleware())
    {
        betCreate.POST("/create", bet.CreateBet) // create a bet
    }
    
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "IIITN Predict Backend is Live!",
        })
    })
    r.Run(":8080")
}