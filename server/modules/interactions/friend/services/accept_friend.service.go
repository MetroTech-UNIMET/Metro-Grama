package services

import (
	"context"
	"net/http"

	"metrograma/db"
	"metrograma/models"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// REVIEW - Estoy asumiendo que si una persona le manda una solicitud de amistad a otra
// este la acepta y se crea otra solicitud de amistad en sentido contrario
// Si ambos usuarios se mandan solicitudes de amistad entre sí, esto no funcionaría
func AcceptFriendshipRequest(me surrealModels.RecordID, other surrealModels.RecordID) (models.FriendEntity, error) {
	if me.Table != "student" || other.Table != "student" {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusBadRequest, "Both IDs must be student RecordIDs")
	}
	if me == other {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusBadRequest, "No puedes agregarte a ti mismo")
	}

	Update_QB := surrealql.UpdateOnly("friend").
		Set("status", "accepted").
		Where("in = $other AND out = $me AND status = 'pending'").
		Return("*")

	// TODO - Sync created
	Create_QB := surrealql.RelateOnly("$me", "friend", "$other").
		Set("status", "accepted")
		// Set("created", "$result.created")

	qb := surrealql.Begin().
		Let("result", Update_QB).
		Let("friendship", Create_QB).
		Return("$friendship")

	sql, vars := qb.Build()

	vars["me"] = me
	vars["other"] = other

	res, err := surrealdb.Query[models.FriendEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.FriendEntity{}, err
	}
	if res == nil || len(*res) == 0 {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusInternalServerError, "No se pudo eliminar la relación de amistad")
	}

	friend := (*res)[0].Result

	return friend, nil

}
