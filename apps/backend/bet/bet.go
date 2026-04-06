package bet

import (
	"fmt"
	"iiitn-predict/packages/database"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateBetRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	EndTime     time.Time `json:"end_time"`
	Category    database.CategoryType `json:"category" binding:"required"`
	InitialPool float64               `json:"initial_pool"`
}

func CreateBet(c *gin.Context) {
	var req CreateBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	seed := req.InitialPool
	if seed <= 0 {
		seed = 100.0 // Default 100 Yes / 100 No (50% odds)
	}

	betDetails := database.Market{
		Question:    req.Title,
		Description: req.Description,
		Category:    req.Category,
		EndTime:     req.EndTime,
		Status:      database.StatusActive,
		
		// Initialize Pools for AMM Logic
		PoolYes:     seed,
		PoolNo:      seed,
		Probability: 50.0, // Starts at 50%
	}

	if err := database.DB.Create(&betDetails).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create bet"})
		return
	}

	initialHistory := database.MarketHistory{
		MarketID:    betDetails.ID,
		Probability: 50.0,
	}
	database.DB.Create(&initialHistory)

	c.JSON(200, gin.H{"msg": "Bet created successfully", "bet_id": betDetails.ID})
}

type PlaceBetRequest struct {
	Amount    int32 `json:"amount"`
	MarketID  uint    `json:"market_id"`
	IsYes     bool    `json:"is_yes"`
}

func PlaceBet(c *gin.Context) {
	var req PlaceBetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	// Get user ID from auth middleware context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var user database.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(500, gin.H{"error": "No such user is present"})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {

		// A. Fetch User & Lock Row (Prevent double spending)
		var user database.User
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&user, userID).Error; err != nil {
			return fmt.Errorf("user not found")
		}

		// B. Fetch Market
		var market database.Market
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&market, req.MarketID).Error; err != nil {
			return fmt.Errorf("market not found")
		}

		// C. Validations
		if user.WildCoins < (float64)(req.Amount) {
			return fmt.Errorf("insufficient balance")
		}
		if market.Status != database.StatusActive || time.Now().After(market.EndTime) {
			return fmt.Errorf("betting is closed for this market")
		}

		// D. CALCULATE SHARES & PRICE (Simplified AMM Logic)
		// Logic: Price = Pool / (PoolYes + PoolNo). 
		// If many people bet YES, PoolYes gets bigger -> Price of YES goes UP.
		
		currentPoolYes := market.PoolYes
		currentPoolNo := market.PoolNo
		totalPool := currentPoolYes + currentPoolNo

		// Calculate Price based on which side they are betting
		var pricePerShare float64
		if req.IsYes {
			// If betting YES, price is determined by ratio of YES in pool
			// Higher demand for YES = Higher Price
			pricePerShare = currentPoolYes / totalPool
		} else {
			pricePerShare = currentPoolNo / totalPool
		}

		// Safety: Prevent price from being 0 or 1 completely
		if pricePerShare < 0.01 { pricePerShare = 0.01 }
		if pricePerShare > 0.99 { pricePerShare = 0.99 }

		// Calculate Shares received
		sharesReceived := (float64)(req.Amount) / pricePerShare

		// E. UPDATE DATABASE
		
		// 1. Deduct Money
		user.WildCoins -= (float64)(req.Amount)
		if err := tx.Save(&user).Error; err != nil {
			return err
		}

		// 2. Add to Market Pool & Recalculate Probability
		if req.IsYes {
			market.PoolYes += (float64)(req.Amount)
		} else {
			market.PoolNo += (float64)(req.Amount)
		}
		
		// New Probability for the Graph (Always track YES probability)
		newTotal := market.PoolYes + market.PoolNo
		market.Probability = (market.PoolYes / newTotal) * 100
		
		if err := tx.Save(&market).Error; err != nil {
			return err
		}

		// 3. Create Transaction Record
		transaction := database.Transaction{
			UserID:      userID.(uint),
			MarketID:    &req.MarketID,
			Amount:      (float64)(req.Amount),
			Type:        database.TransactionTypeBetPlaced,
			Description: fmt.Sprintf("Bet on Market %d", req.MarketID),
		}
		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		// 4. Create/Update Position (User's Portfolio)
		var position database.Position
		// Check if user already has a position on this side
		result := tx.Where("user_id = ? AND market_id = ? AND is_yes = ?", userID, req.MarketID, req.IsYes).First(&position)
		
		if result.Error == nil {
			// Update existing position
			position.Shares += sharesReceived
			position.AmountSpent += (float64)(req.Amount)
			if err := tx.Save(&position).Error; err != nil {
				return err
			}
		} else {
			// Create new position
			newPos := database.Position{
				UserID:      userID.(uint),
				MarketID:    req.MarketID,
				IsYes:       req.IsYes,
				Shares:      sharesReceived,
				AmountSpent: (float64)(req.Amount),
			}
			if err := tx.Create(&newPos).Error; err != nil {
				return err
			}
		}

		// 5. Update Graph History
		history := database.MarketHistory{
			MarketID:    req.MarketID,
			Probability: market.Probability,
		}
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		return nil // Commit transaction
	})

	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"msg": "Bet placed successfully"})
}	

type BetDiscussionRequest struct {
	MarketID uint   `json:"market_id"`
	Comment  string `json:"comment"`
}

func DiscussionOnBet(c *gin.Context) {
	var req BetDiscussionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	// Get user ID from auth middleware context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var user database.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(500, gin.H{"error": "No such user is present"})
		return
	}

	var market database.Market
	if err := database.DB.First(&market, req.MarketID).Error; err != nil {
		c.JSON(500, gin.H{"error": "No such market is present"})
		return
	}

	if market.Status == database.StatusResolved {
		c.JSON(400, gin.H{"error": "Discussion time has ended for this market"})
		return
	}

	comment := database.Comment{
		UserID: userID.(uint),
		MarketID: req.MarketID,
		Content: req.Comment,
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to add comment"})
		return
	}
	c.JSON(200, gin.H{"msg": "Comment added successfully", "comment_id": comment.ID})
}