package services

import (
	"context"
	"net/http"
	"strings"

	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/notifications/services"
	notificationsws "metrograma/modules/notifications/websocket"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// REVIEW - Dado que la notificaion se crea en un evento, tengo que hacer un select para obtenerla
// Si ocurre un error al obtenerla, la transaccion de la amistad ya se hizo
func RelateFriends(me surrealModels.RecordID, other surrealModels.RecordID) (models.FriendEntity, error) {
	if me.Table != "student" || other.Table != "student" {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusBadRequest, "Both IDs must be student RecordIDs")
	}
	if me == other {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusBadRequest, "No puedes agregarte a ti mismo")
	}

	exists_Qb := surrealql.
		Select("friend").
		Field("*").
		Where("(in = $other AND out = $me) OR (in = $me AND out = $other)")

	Update_QB, Create_QB := getAcceptFriendQueries()

	tx := surrealql.Begin().
		Let("exists", exists_Qb).
		If("count($exists) = 0").
		Then(func(tb *surrealql.ThenBuilder) {
			tb.
				Let("friendship", surrealql.RelateOnly("$me", "friend", "$other")).
				Return("$friendship")
		}).
		End().
		If("count($exists) = 1 AND array::first($exists).status = 'pending'").
		Then(func(tb *surrealql.ThenBuilder) {
			tb.
				Let("result", Update_QB).
				Let("friendship", Create_QB).
				Return("$friendship")
		}).
		End().
		If("count($exists) >= 2").
		Then(func(tb *surrealql.ThenBuilder) {
			tb.Throw("Ya eres amigo de esta persona")
		}).
		End()
		// Return("$friendship")

	sql, vars := tx.Build()

	vars["me"] = me
	vars["other"] = other

	res, err := surrealdb.Query[models.FriendEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		// Map friendly conflict to HTTP 409
		if strings.Contains(err.Error(), "already_friends") {
			return models.FriendEntity{}, echo.NewHTTPError(http.StatusConflict, "Ya son amigos")
		}
		return models.FriendEntity{}, err
	}

	if res == nil || len(*res) == 0 {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusInternalServerError, "No se recibió respuesta de la transacción")
	}
	last := (*res)[len(*res)-1].Result

	notification, err := services.GetNotificationFriendRequest(last.ID)
	if err != nil {
		return models.FriendEntity{}, err
	}
	if notification.ID.Table == "" {
		return models.FriendEntity{}, echo.NewHTTPError(http.StatusInternalServerError, "No se pudo obtener la notificación de solicitud de amistad recién creada")
	}

	err = notificationsws.EmitNewNotification(notification)
	if err != nil {
		return models.FriendEntity{}, err
	}
	return last, nil
}
