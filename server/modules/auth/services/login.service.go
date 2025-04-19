package services

import (
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

var loginQuery = "SELECT id, role, verified FROM user WHERE email = $email AND crypto::bcrypt::compare(password, $password) = true"

type UserLoginResult struct {
	ID   surrealModels.RecordID `json:"id"`
	Role surrealModels.RecordID `json:"role"`
	Verified bool   `json:"verified"`
}

func LoginUser(login models.UserLoginForm) (*AuthResult, error) {
	result, err := surrealdb.Query[[]UserLoginResult](db.SurrealDB, loginQuery, map[string]any{
		"email":    login.Email,
		"password": login.Password,
	})

	if err != nil {
		return nil, err
	}

	if len(*result) == 0 {
		return nil, fmt.Errorf("incorrect credentials")
	}

	userResult := (*result)[0].Result[0]
	user := models.MinimalUser{
		ID:   userResult.ID,
		Role: userResult.Role,
	}

	return GetAuthResult(user, userResult.Verified), nil
} 