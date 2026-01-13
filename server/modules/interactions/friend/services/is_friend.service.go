package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func IsFriend(a, b surrealModels.RecordID) (bool, error) {
	qb := surrealql.Select("friend").
		Field("*").
		Where("status = 'accepted'").
		Where("(in = $a AND out = $b) OR (in = $b AND out = $a)")

	sql, vars := qb.Build()

	vars["a"] = a
	vars["b"] = b

	res, err := surrealdb.Query[[]models.FriendEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return false, err
	}

	friendEntities := (*res)[0].Result

	if len(friendEntities) == 2 {
		return true, nil
	}

	return false, nil
}

func IsFriendOfAFriend(a, b surrealModels.RecordID) (bool, error) {
	sql, vars := surrealql.Expr("? IN ?.{2}(->friend->student)", b, a).Build()

	res, err := surrealdb.Query[bool](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return false, err
	}

	isFriendOfAFriend := (*res)[0].Result

	return isFriendOfAFriend, nil
}
