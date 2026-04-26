package auth

import (
	"net/mail"
)

// DEPRECATED TYPES - Kept for reference only
// All authentication is now handled by Clerk

func ValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
