package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	dsn := os.Getenv("DATABASE_URL")

	if dsn == "" {
		panic("DATABASE_URL is not set in environment")
	}

	fmt.Println("Connecting to database...")

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}

	log.Println("Database connected successfully")

	// Run migrations
	if err := DB.AutoMigrate(
		&User{},
		&Market{},
		&MarketHistory{},
		&Position{},
		&Transaction{},
		&Comment{},
	); err != nil {
		panic(fmt.Sprintf("Failed to migrate database: %v", err))
	}

	// Manual migration: Drop old 'amount' column from positions table if it exists
	if DB.Migrator().HasColumn(&Position{}, "amount") {
		log.Println("Dropping old 'amount' column from positions table...")
		if err := DB.Migrator().DropColumn(&Position{}, "amount"); err != nil {
			log.Printf("Warning: Failed to drop old 'amount' column: %v", err)
		}
	}
}

type RoleType string

const (
	RoleTypeAdmin   RoleType = "ADMIN"
	RoleTypeStudent RoleType = "STUDENT"
)

type MarketStatus string

const (
	StatusActive   MarketStatus = "ACTIVE"
	StatusLocked   MarketStatus = "LOCKED"
	StatusResolved MarketStatus = "RESOLVED"
)

type TransactionType string

const (
	TransactionTypeSignupBonus TransactionType = "SIGNUP_BONUS"
	TransactionTypeDeposit     TransactionType = "DEPOSIT"
	TransactionTypeBetPlaced   TransactionType = "BET_PLACED"
	TransactionTypePayout      TransactionType = "PAYOUT"
)

type CategoryType string

const (
	CategoryTech   CategoryType = "TECH"
	CategorySports CategoryType = "SPORTS"
	CategoryCrypto CategoryType = "CRYPTO"
	CategoryCampus CategoryType = "CAMPUS"
)

type User struct {
	gorm.Model
	ID              uint     `gorm:"primaryKey"`
	ClerkID         string   `gorm:"uniqueIndex;not null"`
	Name            string   `gorm:"not null"`
	Email           string   `gorm:"uniqueIndex;not null"`
	ProfileImageUrl string   `gorm:"type:varchar(500)"`
	WildCoins       float64  `gorm:"default:10000.0;not null"`
	Role            RoleType `gorm:"default:'STUDENT'"`
	Positions       []Position
	Transactions    []Transaction
	Comments        []Comment
}

type Market struct {
	gorm.Model
	Question    string       `gorm:"not null"`
	Description string       `gorm:"type:text"`
	ImageUrl    string       
	Category    CategoryType `gorm:"index"`
	Status      MarketStatus `gorm:"default:'ACTIVE';index"`
	
	PoolYes     float64      `gorm:"default:0"`
	PoolNo      float64      `gorm:"default:0"`
	
	Probability float64      `gorm:"default:50.0"`
	
	EndTime     time.Time    `gorm:"not null"`
	Outcome     *bool        
	
	Positions     []Position
	MarketHistory []MarketHistory
	Comments      []Comment
}

type MarketHistory struct {
	gorm.Model
	MarketID    uint      `gorm:"not null;index"`
	Probability float64   `gorm:"not null"`
}

type Position struct {
	gorm.Model
	UserID      uint    `gorm:"not null;index"`
	MarketID    uint    `gorm:"not null;index"`
	IsYes       bool    `gorm:"not null"`
	Shares      float64 `gorm:"not null"`
	AmountSpent float64 `gorm:"not null"`
}

type Transaction struct {
	gorm.Model
	UserID      uint            `gorm:"not null;index"`
	Amount      float64         `gorm:"not null"`
	Type        TransactionType `gorm:"not null"`
	MarketID    *uint           
	Description string          
}

type Comment struct {
	gorm.Model
	UserID   uint   `gorm:"not null;index"`
	MarketID uint   `gorm:"not null;index"`
	Content  string `gorm:"type:text;not null"`
	User     User   `gorm:"foreignKey:UserID"`
}