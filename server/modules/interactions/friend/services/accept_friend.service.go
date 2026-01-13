package services

import (
	"context"
	"net/http"

	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/notifications/services"
	notificationsws "metrograma/modules/notifications/websocket"

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

	Update_QB, Create_QB := getAcceptFriendQueries()

	qb := surrealql.Begin().
		Let("result", Update_QB).
		Let("friendship", Create_QB).
		Return("$result")

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

	acceptedFriendRequest := (*res)[0].Result

	notification, err := services.GetNotificationFriendAccepted(acceptedFriendRequest.ID)
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

	return acceptedFriendRequest, nil

}

func getAcceptFriendQueries() (*surrealql.UpdateQuery, *surrealql.RelateQuery) {
	Update_QB := surrealql.UpdateOnly("friend").
		Set("status = 'accepted'").
		Where("in = $other AND out = $me AND status = 'pending'").
		Return("*")

	Create_QB := surrealql.RelateOnly("$me", "friend", "$other").
		Set("status = 'accepted'").
		Set("created = $result.created")

	return Update_QB, Create_QB
}
