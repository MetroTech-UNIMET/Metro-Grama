package services

import (
	"fmt"
	"metrograma/models"
	crudServices "metrograma/modules/auth/services/crud"
	"strings"

	"github.com/labstack/echo/v4"
)

// RegisterUser handles the registration process and returns the appropriate redirect path
func RegisterUser(userForm models.SimpleUserSigninForm) (*AuthResult, error) {
	// Check if user already exists
	existingUser, err := crudServices.ExistUserByEmail(userForm.Email)
	if err != nil && err == echo.ErrNotFound {
		return nil, err
	}
	if existingUser != nil {
		// User already exists, get their verification status
		user, err := crudServices.GetUser(existingUser.ID)
		if err != nil {
			return nil, err
		}
		return GetAuthResult(*existingUser, user.Verified), nil
	}

	// Determine role and redirect path based on email domain
	emailParts := strings.Split(userForm.Email, "@")
	if len(emailParts) != 2 {
		return nil, fmt.Errorf("invalid email format")
	}

	domain := emailParts[1]
	switch domain {
	case "correo.unimet.edu.ve":
		userForm.Role = "student"
		userForm.Verified = false
	case "unimet.edu.ve":
		userForm.Role = "admin"
		userForm.Verified = false
	default:
		return nil, fmt.Errorf("the email domain %s is not allowed", domain)
	}

	createdUser, err := crudServices.CreateSimpleUser(userForm)

	if err != nil {
		return nil, err
	}

	minimalUser := models.MinimalUser{
		ID:   createdUser.ID,
		Role: createdUser.Role,
	}

	return GetAuthResult(minimalUser, userForm.Verified), nil
}
