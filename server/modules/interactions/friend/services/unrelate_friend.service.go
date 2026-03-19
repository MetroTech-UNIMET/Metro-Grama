package services

import (
	"context"
	"net/http"

	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UnrelateFriends(ctx context.Context, me surrealModels.RecordID, other surrealModels.RecordID) (models.FriendEntity, error) {
	if me.Table != "student" || other.Table != "student" {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusBadRequest, "Both IDs must be student RecordIDs")
	}
	if me == other {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusBadRequest, "No puedes eliminarte a ti mismo")
	}

	// Single DELETE using placeholders for me and other; SurrealDB returns deleted rows
	query := surrealql.Delete("friend").Where("(out = $me AND in = $other) OR (out = $other AND in = $me)").Return("*")
	sql, vars := query.Build()

	vars["me"] = me
	vars["other"] = other

	res, err := surrealdb.Query[[]models.FriendEntity](ctx, db.SurrealDB, sql, vars)
	if err != nil {
		return models.FriendEntity{}, err
	}

	friend, err := tools.SafeResult(res, 0)
	if err != nil {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusInternalServerError, "Se eliminó pero no se devolvieron datos")
	}
	if len(friend) == 0 {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusInternalServerError, "Se eliminó pero no se devolvieron datos")
	}
	return friend[0], nil
}
