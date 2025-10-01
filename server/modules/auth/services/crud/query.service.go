package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func ExistUserByEmail(email string) (models.MinimalUser, error) {
	// TODO - Add ONLY
	qb := surrealql.Select("user").
		FieldName("id").
		FieldName("role").
		WhereEq("email", email)

	sql, args := qb.Build()

	result, err := surrealdb.Query[[]models.MinimalUser](context.Background(), db.SurrealDB, sql, args)

	if err != nil {
		return models.MinimalUser{}, err
	}

	if result == nil {
		return models.MinimalUser{}, echo.NewHTTPError(http.StatusUnauthorized, "incorrect credentials")
	}

	users := (*result)[0].Result
	if len(users) == 0 {
		return models.MinimalUser{}, echo.NewHTTPError(http.StatusUnauthorized, "incorrect credentials")
	}

	return users[0], nil
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
