package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type UserLoginResult struct {
	ID       surrealModels.RecordID `json:"id"`
	Role     surrealModels.RecordID `json:"role"`
	Verified bool                   `json:"verified"`
}

func LoginUser(login models.UserLoginForm) (*AuthResult, error) {
	qb := surrealql.SelectOnly("user").
		FieldName("id").
		FieldName("role").
		FieldName("verified").
		Where("email = ?", login.Email).
		Where("crypto::bcrypt::compare(password, ?) = true", login.Password)

	sql, vars := qb.Build()

	result, err := surrealdb.Query[UserLoginResult](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return nil, err
	}

	if len(*result) == 0 {
		return nil, fmt.Errorf("incorrect credentials")
	}

	userResult := (*result)[0].Result
	user := models.MinimalUser{
		ID:   userResult.ID,
		Role: userResult.Role,
	}

	return GetAuthResult(user, userResult.Verified), nil
}
