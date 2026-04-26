package database

import (
	"fmt"
	"log"
)

// SeedAdmin ensures an admin record exists for the ADMIN_EMAIL.
// It uses a placeholder clerk_id ("admin_placeholder") until the admin
// signs in via Clerk, at which point the webhook will update it to the real clerk_id.
func SeedAdmin() {
	adminEmail := AdminEmail()
	if adminEmail == "" {
		log.Println("[SeedAdmin] ADMIN_EMAIL not set, skipping admin seed")
		return
	}

	const placeholderClerkID = "admin_placeholder"

	var existingUser User
	// Check if a user with this email already exists (including soft-deleted rows)
	if err := DB.Unscoped().Where("LOWER(email) = ?", adminEmail).First(&existingUser).Error; err == nil {
		// User exists — make sure the role is ADMIN
		if existingUser.Role != RoleTypeAdmin {
			if err := DB.Unscoped().Model(&existingUser).Update("role", RoleTypeAdmin).Error; err != nil {
				log.Printf("[SeedAdmin] Failed to promote existing user to admin: %v", err)
				return
			}
			log.Printf("[SeedAdmin] Promoted existing user %s to ADMIN", adminEmail)
		} else {
			log.Printf("[SeedAdmin] Admin user already exists: %s", adminEmail)
		}
		return
	}

	// No record found — create a new admin row with a placeholder clerk_id.
	// The placeholder will be replaced with the real Clerk ID when the admin first signs in.
	admin := User{
		ClerkID: placeholderClerkID,
		Name:    "Admin",
		Email:   adminEmail,
		Role:    RoleTypeAdmin,
	}

	if err := DB.Create(&admin).Error; err != nil {
		log.Printf("[SeedAdmin] Failed to seed admin user: %v", err)
		return
	}

	fmt.Printf("[SeedAdmin] Admin user seeded successfully (%s)\n", adminEmail)
}
