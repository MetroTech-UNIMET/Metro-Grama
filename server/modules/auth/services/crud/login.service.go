package services

import (
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
)

var loginQuery = "SELECT id, role FROM user WHERE email = $email AND crypto::bcrypt::compare(password, $password) = true"

func LoginUser(login models.UserLoginForm) (models.MinimalUser, error) {
	result, err := surrealdb.Query[[]models.MinimalUser](db.SurrealDB, loginQuery, map[string]any{
		"email":    login.Email,
		"password": login.Password,
	})

	if err != nil {
		return models.MinimalUser{}, err
	}

	if len(*result) == 0 {
		return models.MinimalUser{}, fmt.Errorf("incorrect credentials")
	}
	user := (*result)[0].Result

	return user[0], nil
} 