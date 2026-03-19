package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/auth/DTO"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func ExistUserByEmail(ctx context.Context, email string) (*DTO.MinimalUser, error) {
	qb := surrealql.SelectOnly("user").
		FieldName("id").
		FieldName("role").
		WhereEq("email", email)

	sql, args := qb.Build()

	result, err := surrealdb.Query[DTO.MinimalUser](ctx, db.SurrealDB, sql, args)

	if err != nil {
		return nil, err
	}

	user, err := tools.SafeResult(result, 0)
	if err != nil {
		return nil, err
	}
	if user.ID.ID == nil {
		return nil, echo.NewHTTPError(http.StatusNotFound, "incorrect credentials")
	}

	return &user, nil
}

func ExistUser(ctx context.Context, id surrealModels.RecordID) (DTO.MinimalUser, error) {
	user, err := surrealdb.Select[DTO.MinimalUser](ctx, db.SurrealDB, id)

	if err != nil {
		return DTO.MinimalUser{}, err
	}

	if user == nil || user.ID.ID == nil {
		return DTO.MinimalUser{}, echo.NewHTTPError(http.StatusNotFound, "user not found")
	}

	return *user, nil
}

func GetUser(ctx context.Context, id surrealModels.RecordID) (models.UserEntity, error) {
	user, err := surrealdb.Select[models.UserEntity](ctx, db.SurrealDB, id)

	if err != nil {
		return models.UserEntity{}, err
	}

	if user == nil || user.ID.ID == nil {
		return models.UserEntity{}, echo.NewHTTPError(http.StatusNotFound, "user not found")
	}

	return *user, nil
}
