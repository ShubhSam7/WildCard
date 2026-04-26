package database

import (
	"fmt"
	"log"
	"os"
	"strings"
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

	dsnRaw := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	dsn := strings.Trim(dsnRaw, "\"'")
	if dsnRaw != dsn {
		log.Println("DATABASE_URL had surrounding quotes; trimmed automatically")
	}

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

	// Manual migration: Clerk authentication changes
	log.Println("Running Clerk authentication migrations...")
	
	// 1. Drop password column if it exists (Clerk handles passwords now)
	if DB.Migrator().HasColumn(&User{}, "password") {
		log.Println("Dropping 'password' column from users table (Clerk handles auth)...")
		if err := DB.Migrator().DropColumn(&User{}, "password"); err != nil {
			log.Printf("Warning: Failed to drop 'password' column: %v", err)
		}
	}
	
	// 2. Rename balance to wild_coins if needed
	if DB.Migrator().HasColumn(&User{}, "balance") {
		log.Println("Renaming 'balance' column to 'wild_coins'...")
		if err := DB.Migrator().RenameColumn(&User{}, "balance", "wild_coins"); err != nil {
			log.Printf("Warning: Failed to rename 'balance' column: %v", err)
		}
	}
	
	// 3. Add clerk_id column if it doesn't exist (handle both new and existing tables)
	if !DB.Migrator().HasColumn(&User{}, "clerk_id") && !DB.Migrator().HasColumn(&User{}, "clerkid") {
		log.Println("Adding 'clerk_id' column to users table...")
		// Add as nullable first, then we'll handle the constraint
		if err := DB.Exec("ALTER TABLE users ADD COLUMN clerk_id TEXT").Error; err != nil {
			log.Printf("Warning: Failed to add 'clerk_id' column: %v", err)
		}
	}
	
	// 4. Rename clerkid to clerk_id if needed (standardize naming)
	if DB.Migrator().HasColumn(&User{}, "clerkid") {
		log.Println("Renaming 'clerkid' column to 'clerk_id'...")
		if err := DB.Migrator().RenameColumn(&User{}, "clerkid", "clerk_id"); err != nil {
			log.Printf("Warning: Failed to rename 'clerkid' column: %v", err)
		}
	}
	
	// 5. For existing rows with null clerk_id, generate a placeholder value
	// This allows the migration to proceed - you should update these values properly later
	var nullClerkIdCount int64
	DB.Model(&User{}).Where("clerk_id IS NULL OR clerk_id = ''").Count(&nullClerkIdCount)
	if nullClerkIdCount > 0 {
		log.Printf("Found %d users without clerk_id, setting placeholder values...", nullClerkIdCount)
		// Set placeholder clerk_id based on user ID to maintain uniqueness
		if err := DB.Exec("UPDATE users SET clerk_id = 'migration_placeholder_' || id::text WHERE clerk_id IS NULL OR clerk_id = ''").Error; err != nil {
			log.Printf("Warning: Failed to update null clerk_id values: %v", err)
		}
	}
	
	// 6. Add NOT NULL and UNIQUE constraints if they don't exist
	if DB.Migrator().HasColumn(&User{}, "clerk_id") {
		log.Println("Adding constraints to clerk_id column...")
		// Add NOT NULL constraint
		DB.Exec("ALTER TABLE users ALTER COLUMN clerk_id SET NOT NULL")
		// Add unique index if it doesn't exist
		DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id)")
	}
	
	// Note: profile_image_url will be added automatically by AutoMigrate above
	log.Println("Clerk authentication migrations completed!")
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
	ClerkID         string   `gorm:"uniqueIndex"`
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
	Question    string `gorm:"not null"`
	Description string `gorm:"type:text"`
	ImageUrl    string
	Category    CategoryType `gorm:"index"`
	Status      MarketStatus `gorm:"default:'ACTIVE';index"`

	PoolYes float64 `gorm:"default:0"`
	PoolNo  float64 `gorm:"default:0"`

	Probability float64 `gorm:"default:50.0"`

	EndTime time.Time `gorm:"not null"`
	Outcome *bool

	Positions     []Position
	MarketHistory []MarketHistory
	Comments      []Comment
}

type MarketHistory struct {
	gorm.Model
	MarketID    uint    `gorm:"not null;index"`
	Probability float64 `gorm:"not null"`
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
