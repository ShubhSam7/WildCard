package bet

import (
	"fmt"
	"iiitn-predict/packages/database"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ─── Market Response DTOs ──────────────────────────────────────────────────

type MarketResponse struct {
	ID          uint    `json:"id"`
	Question    string  `json:"question"`
	Category    string  `json:"category"`
	YesPrice    float64 `json:"yes_price"`
	NoPrice     float64 `json:"no_price"`
	PoolYes     float64 `json:"pool_yes"`
	PoolNo      float64 `json:"pool_no"`
	Volume      float64 `json:"volume"`
	Probability float64 `json:"probability"`
	EndTime     string  `json:"end_time"`
	Status      string  `json:"status"`
	Trending    bool    `json:"trending"`
}

// ─── GET /bet/markets?category=ALL ────────────────────────────────────────

func GetMarkets(c *gin.Context) {
	category := c.Query("category")

	var markets []database.Market
	query := database.DB.Where("status = ?", database.StatusActive)
	if category != "" && category != "ALL" {
		query = query.Where("category = ?", database.CategoryType(category))
	}
	if err := query.Order("created_at DESC").Find(&markets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch markets"})
		return
	}

	// Find IDs of top 3 trending markets by total pool
	trendingIDs := map[uint]bool{}
	type poolResult struct {
		ID        uint
		TotalPool float64
	}
	var poolResults []poolResult
	database.DB.Model(&database.Market{}).
		Where("status = ?", database.StatusActive).
		Select("id, (pool_yes + pool_no) as total_pool").
		Order("total_pool DESC").
		Limit(3).
		Scan(&poolResults)
	for _, r := range poolResults {
		trendingIDs[r.ID] = true
	}

	var result []MarketResponse
	for _, m := range markets {
		totalPool := m.PoolYes + m.PoolNo
		yesPrice := 50.0
		noPrice := 50.0
		if totalPool > 0 {
			yesPrice = (m.PoolYes / totalPool) * 100
			noPrice = (m.PoolNo / totalPool) * 100
		}
		result = append(result, MarketResponse{
			ID:          m.ID,
			Question:    m.Question,
			Category:    string(m.Category),
			YesPrice:    yesPrice,
			NoPrice:     noPrice,
			PoolYes:     m.PoolYes,
			PoolNo:      m.PoolNo,
			Volume:      totalPool,
			Probability: m.Probability,
			EndTime:     m.EndTime.Format("Jan 02, 2006"),
			Status:      string(m.Status),
			Trending:    trendingIDs[m.ID],
		})
	}

	if result == nil {
		result = []MarketResponse{}
	}
	c.JSON(http.StatusOK, result)
}

// ─── GET /leaderboard ─────────────────────────────────────────────────────

type LeaderboardEntry struct {
	Rank            int     `json:"rank"`
	Name            string  `json:"name"`
	ProfileImageUrl string  `json:"profile_image_url"`
	WildCoins       float64 `json:"wild_coins"`
}

func GetLeaderboard(c *gin.Context) {
	var users []database.User
	if err := database.DB.
		Order("wild_coins DESC").
		Limit(50).
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch leaderboard"})
		return
	}

	entries := make([]LeaderboardEntry, 0, len(users))
	for i, u := range users {
		entries = append(entries, LeaderboardEntry{
			Rank:            i + 1,
			Name:            u.Name,
			ProfileImageUrl: u.ProfileImageUrl,
			WildCoins:       u.WildCoins,
		})
	}
	c.JSON(http.StatusOK, entries)
}

// ─── GET /user/balance  (requires ClerkMiddleware) ─────────────────────────

func GetUserBalance(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var user database.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"wildCoins": user.WildCoins,
		"name":      user.Name,
	})
}

// ─── GET /user/stats  (requires ClerkMiddleware) ──────────────────────────

func GetUserStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var user database.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	var activePositions int64
	database.DB.Model(&database.Position{}).Where("user_id = ?", userID).Count(&activePositions)
	c.JSON(http.StatusOK, gin.H{
		"wildCoins":       user.WildCoins,
		"activePositions": activePositions,
	})
}

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