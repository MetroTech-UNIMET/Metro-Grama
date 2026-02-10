package services

import (
	"context"

	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// MarkNotificationsAsRead flags the provided notifications as read for the given user.
func MarkNotificationsAsRead(userID surrealModels.RecordID, notificationIDs []surrealModels.RecordID) ([]models.Notification, error) {
	if len(notificationIDs) == 0 {
		return []models.Notification{}, nil
	}

	qb := surrealql.Update("notification").
		Where("user = $userId").
		Where("id IN $notificationIds").
		Set("read", true).
		Set("read_at", surrealql.Expr("time::now()"))

	query, params := qb.Build()
	params["userId"] = userID
	params["notificationIds"] = notificationIDs

	res, err := surrealdb.Query[[]models.Notification](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}

	updated := (*res)[0].Result
	if updated == nil {
		return []models.Notification{}, nil
	}

	return updated, nil
}
