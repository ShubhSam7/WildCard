package main

import (
	"iiitn-predict/apps/backend/auth"
	"iiitn-predict/apps/backend/bet"
	"iiitn-predict/packages/database"

	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()
	// database.SeedAdmin()
	r := gin.Default()

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/signup", auth.Signup)          // signup the user with 10k coins
		authGroup.POST("/signin", auth.Signin)          // signin the user
		authGroup.POST("/admin/login", auth.AdminLogin) //admin login
	}

	betGroup := r.Group("/bet")
	betGroup.Use(auth.Middleware()) // auth middleware to protect the routes
	{
		betGroup.POST("/place", bet.PlaceBet)             // place a bet
		betGroup.POST("/discussion", bet.DiscussionOnBet) // discussion on a bet
	}

	betCreate := r.Group("/bet")
	betCreate.Use(auth.AdminMiddleware())
	{
		betCreate.POST("/create", bet.CreateBet) // create a bet
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "WildCard backend is live!",
		})
	})
	r.Run(":8080")
}
