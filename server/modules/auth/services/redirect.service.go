package services

import (
	"fmt"
	"metrograma/env"
	"metrograma/modules/auth/DTO"
)

type AuthResult struct {
	User         DTO.MinimalUser
	RedirectPath string
	Message      string
	IsVerified   bool
}

// GetRedirectPath determines where to redirect the user based on their role and verification status
func GetAuthResult(user DTO.MinimalUser, isVerified bool) *AuthResult {
	// If user is not verified, redirect to registration
	if !isVerified {
		roleStr := user.Role.ID
		return &AuthResult{
			User:         user,
			RedirectPath: fmt.Sprintf("%s/register/%s", env.GetDotEnv("FRONTEND_ADDRS"), roleStr),
			Message:      fmt.Sprintf("Please complete your %s registration", roleStr),
			IsVerified:   false,
		}
	}

	// If verified, redirect to main app
	return &AuthResult{
		User:         user,
		RedirectPath: fmt.Sprintf("%s/materias", env.GetDotEnv("FRONTEND_ADDRS")),
		Message:      "Login successful",
		IsVerified:   true,
	}
}
