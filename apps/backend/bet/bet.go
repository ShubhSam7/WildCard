package bet

import (
	"fmt"
	"iiitn-predict/packages/database"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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

type LeaderboardEntry struct {
	Rank            int     `json:"rank"`
	Name            string  `json:"name"`
	ProfileImageUrl string  `json:"profile_image_url"`
	WildCoins       float64 `json:"wild_coins"`
}

type PortfolioSummaryResponse struct {
	TotalInvested   float64 `json:"total_invested"`
	TotalValue      float64 `json:"total_value"`
	TotalPnL        float64 `json:"total_pnl"`
	TotalPnLPercent float64 `json:"total_pnl_percent"`
	ActivePositions int     `json:"active_positions"`
}

type PortfolioPositionResponse struct {
	ID           uint    `json:"id"`
	MarketID     uint    `json:"market_id"`
	Question     string  `json:"question"`
	Position     string  `json:"position"`
	Shares       float64 `json:"shares"`
	AvgPrice     float64 `json:"avg_price"`
	CurrentPrice float64 `json:"current_price"`
	Invested     float64 `json:"invested"`
	CurrentValue float64 `json:"current_value"`
	PnL          float64 `json:"pnl"`
	PnLPercent   float64 `json:"pnl_percent"`
	EndTime      string  `json:"end_time"`
}

type PortfolioActivityResponse struct {
	ID          uint    `json:"id"`
	Type        string  `json:"type"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	MarketID    *uint   `json:"market_id"`
	MarketTitle string  `json:"market_title"`
	CreatedAt   string  `json:"created_at"`
}

func validCategory(category string) bool {
	switch database.CategoryType(category) {
	case database.CategoryTech, database.CategorySports, database.CategoryCrypto, database.CategoryCampus:
		return true
	default:
		return false
	}
}

func GetMarkets(c *gin.Context) {
	categoryRaw := strings.ToUpper(strings.TrimSpace(c.Query("category")))

	var markets []database.Market
	query := database.DB.Where("status = ?", database.StatusActive)
	if categoryRaw != "" && categoryRaw != "ALL" {
		if !validCategory(categoryRaw) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category"})
			return
		}
		query = query.Where("category = ?", database.CategoryType(categoryRaw))
	}
	if err := query.Order("created_at DESC").Find(&markets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch markets"})
		return
	}

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

	result := make([]MarketResponse, 0, len(markets))
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

	c.JSON(http.StatusOK, result)
}

func GetLeaderboard(c *gin.Context) {
	var users []database.User
	if err := database.DB.
		Order("wild_coins DESC").
		Order("created_at ASC").
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

func GetUserPortfolio(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	type positionRow struct {
		ID          uint
		MarketID    uint
		IsYes       bool
		Shares      float64
		AmountSpent float64
		Question    string
		EndTime     time.Time
		PoolYes     float64
		PoolNo      float64
	}

	var rows []positionRow
	if err := database.DB.Table("positions p").
		Select("p.id, p.market_id, p.is_yes, p.shares, p.amount_spent, m.question, m.end_time, m.pool_yes, m.pool_no").
		Joins("JOIN markets m ON m.id = p.market_id").
		Where("p.user_id = ?", userID).
		Order("p.created_at DESC").
		Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch portfolio"})
		return
	}

	positions := make([]PortfolioPositionResponse, 0, len(rows))
	totalInvested := 0.0
	totalValue := 0.0

	for _, row := range rows {
		totalPool := row.PoolYes + row.PoolNo
		yesPrice := 50.0
		noPrice := 50.0
		if totalPool > 0 {
			yesPrice = (row.PoolYes / totalPool) * 100
			noPrice = (row.PoolNo / totalPool) * 100
		}

		currentPricePercent := noPrice
		positionLabel := "NO"
		if row.IsYes {
			currentPricePercent = yesPrice
			positionLabel = "YES"
		}

		avgPrice := 0.0
		if row.Shares > 0 {
			avgPrice = (row.AmountSpent / row.Shares) * 100
		}

		currentValue := row.Shares * (currentPricePercent / 100)
		pnl := currentValue - row.AmountSpent
		pnlPercent := 0.0
		if row.AmountSpent > 0 {
			pnlPercent = (pnl / row.AmountSpent) * 100
		}

		totalInvested += row.AmountSpent
		totalValue += currentValue

		positions = append(positions, PortfolioPositionResponse{
			ID:           row.ID,
			MarketID:     row.MarketID,
			Question:     row.Question,
			Position:     positionLabel,
			Shares:       row.Shares,
			AvgPrice:     avgPrice,
			CurrentPrice: currentPricePercent,
			Invested:     row.AmountSpent,
			CurrentValue: currentValue,
			PnL:          pnl,
			PnLPercent:   pnlPercent,
			EndTime:      row.EndTime.Format("Jan 02, 2006"),
		})
	}

	totalPnL := totalValue - totalInvested
	totalPnLPercent := 0.0
	if totalInvested > 0 {
		totalPnLPercent = (totalPnL / totalInvested) * 100
	}

	type transactionRow struct {
		ID          uint
		Type        string
		Description string
		Amount      float64
		MarketID    *uint
		CreatedAt   time.Time
		Question    *string
	}

	var transactionRows []transactionRow
	if err := database.DB.Table("transactions t").
		Select("t.id, t.type, t.description, t.amount, t.market_id, t.created_at, m.question").
		Joins("LEFT JOIN markets m ON m.id = t.market_id").
		Where("t.user_id = ?", userID).
		Order("t.created_at DESC").
		Limit(10).
		Scan(&transactionRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch activity"})
		return
	}

	activities := make([]PortfolioActivityResponse, 0, len(transactionRows))
	for _, row := range transactionRows {
		title := ""
		if row.Question != nil {
			title = *row.Question
		}

		activities = append(activities, PortfolioActivityResponse{
			ID:          row.ID,
			Type:        row.Type,
			Description: row.Description,
			Amount:      row.Amount,
			MarketID:    row.MarketID,
			MarketTitle: title,
			CreatedAt:   row.CreatedAt.Format(time.RFC3339),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"summary": PortfolioSummaryResponse{
			TotalInvested:   totalInvested,
			TotalValue:      totalValue,
			TotalPnL:        totalPnL,
			TotalPnLPercent: totalPnLPercent,
			ActivePositions: len(positions),
		},
		"positions":  positions,
		"activities": activities,
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
