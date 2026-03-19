package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/modules/auth/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type UserLoginResult struct {
	ID       surrealModels.RecordID `json:"id"`
	Role     surrealModels.RecordID `json:"role"`
	Verified bool                   `json:"verified"`
}

func LoginUser(ctx context.Context, login DTO.UserLoginForm) (*AuthResult, error) {
	qb := surrealql.SelectOnly("user").
		FieldName("id").
		FieldName("role").
		FieldName("verified").
		Where("email = ?", login.Email).
		Where("crypto::bcrypt::compare(password, ?) = true", login.Password)

	sql, vars := qb.Build()

	result, err := surrealdb.Query[UserLoginResult](ctx, db.SurrealDB, sql, vars)

	if err != nil {
		return nil, err
	}

	userResult, err := tools.SafeResult(result, 0)
	if err != nil {
		return nil, fmt.Errorf("incorrect credentials")
	}

	user := DTO.MinimalUser{
		ID:   userResult.ID,
		Role: userResult.Role,
	}

	return GetAuthResult(user, userResult.Verified), nil
}
