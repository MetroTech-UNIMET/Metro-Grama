package services

import (
	"context"
	"metrograma/db"
	"metrograma/modules/users/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func GetUser(ctx context.Context, id surrealModels.RecordID) (DTO.UserProfile, error) {
	qb := surrealql.SelectOnly(id).
		Alias("student", surrealql.SelectOnly("student").
			Field("*").
			Where("user = ?", id)).
		Field("*")

	sql, params := qb.Build()

	result, err := surrealdb.Query[DTO.UserProfile](ctx, db.SurrealDB, sql, params)

	if err != nil {
		return DTO.UserProfile{}, err
	}

	user, err := tools.SafeResult(result, 0)
	if err != nil {
		return DTO.UserProfile{}, err
	}

	return user, nil
}
