package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

var existUserByEmailQuery = "SELECT id, role FROM ONLY user WHERE email = $email"

func ExistUserByEmail(email string) (models.MinimalUser, error) {
	result, err := surrealdb.Query[models.MinimalUser](context.Background(), db.SurrealDB, existUserByEmailQuery, map[string]any{
		"email": email,
	})

	if err != nil {
		return models.MinimalUser{}, err
	}

	if result == nil {
		return models.MinimalUser{}, echo.NewHTTPError(http.StatusUnauthorized, "incorrect credentials")
	}

	user := (*result)[0].Result

	return user, nil
}

func ExistUser(id surrealModels.RecordID) (models.MinimalUser, error) {
	user, err := surrealdb.Select[models.MinimalUser](context.Background(), db.SurrealDB, id)

	if err != nil {
		return models.MinimalUser{}, err
	}

	return *user, nil
}

func GetUser(id surrealModels.RecordID) (models.UserEntity, error) {
	user, err := surrealdb.Select[models.UserEntity](context.Background(), db.SurrealDB, id)

	if err != nil {
		return models.UserEntity{}, err
	}

	return *user, nil
}
