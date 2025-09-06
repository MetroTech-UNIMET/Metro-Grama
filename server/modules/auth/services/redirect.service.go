package services

import (
	"fmt"
	"metrograma/env"
	"metrograma/models"
)

type AuthResult struct {
	User         models.MinimalUser
	RedirectPath string
	Message      string
}

// GetRedirectPath determines where to redirect the user based on their role and verification status
func GetAuthResult(user models.MinimalUser, isVerified bool) *AuthResult {
	// If user is not verified, redirect to registration
	if !isVerified {
		roleStr := user.Role.ID
		return &AuthResult{
			User:         user,
			RedirectPath: fmt.Sprintf("%s/register/%s", env.GetDotEnv("FRONTEND_ADDRS"), roleStr),
			Message:      fmt.Sprintf("Please complete your %s registration", roleStr),
		}
	}

	// If verified, redirect to main app
	return &AuthResult{
		User:         user,
		RedirectPath: fmt.Sprintf("%s/materias", env.GetDotEnv("FRONTEND_ADDRS")),
		Message:      "Login successful",
	}
}
