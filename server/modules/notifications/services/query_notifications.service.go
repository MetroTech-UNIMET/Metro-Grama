package services

import (
	"context"

	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/notifications/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetNotificationsByUser fetches notifications for a specific user.
func GetNotificationsByUser(userID surrealModels.RecordID) (DTO.NotificationDTO, error) {
	qb := surrealql.
		Begin().
		Return("{all: ?, unread: ?}",
			getBaseNotificationQuery(),
			getBaseNotificationQuery().Where("read = false"))

	query, params := qb.Build()
	params["userId"] = userID

	res, err := surrealdb.Query[DTO.NotificationDTO](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return DTO.NotificationDTO{}, err
	}

	result := (*res)[0].Result

	return result, nil
}

func GetNotificationFriendAccepted(friendId surrealModels.RecordID) (models.Notification, error) {
	qb := getBaseOnlyNotificationQuery().
		WhereEq("extraData.friend_id", friendId).
		Where("type = 'friendAccepted'")

	query, params := qb.Build()

	res, err := surrealdb.Query[models.Notification](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return models.Notification{}, err
	}

	result := (*res)[0].Result

	return result, nil
}

func GetNotificationFriendRequest(friendId surrealModels.RecordID) (models.Notification, error) {
	qb := getBaseOnlyNotificationQuery().
		WhereEq("extraData.friend_id", friendId).
		Where("type = 'friendRequest'")

	query, params := qb.Build()

	res, err := surrealdb.Query[models.Notification](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return models.Notification{}, err
	}

	result := (*res)[0].Result

	return result, nil
}

func GetNotificationsSubjectSectionUpdate(subjectSectionIds []surrealModels.RecordID) ([]models.Notification, error) {
	// TODO - Seria fino poder hacerlo sin crear una transaccion sino de un simple query con un subquery en el WHERE
	subject_section_history_Qb := surrealql.
		Select("subject_section_history").
		Value("id").
		Where("subject_section IN ?", subjectSectionIds).
		Where("end_date = NONE")

	qb := surrealql.Begin().
		Let("historyIds", subject_section_history_Qb).
		Return("?", surrealql.Select("notification").
			Field("*").
			Where("extraData.history IN $historyIds"))

	query, params := qb.Build()

	res, err := surrealdb.Query[[]models.Notification](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}

	notifs := (*res)[0].Result
	return notifs, nil
}

func getBaseOnlyNotificationQuery() *surrealql.SelectQuery {
	return surrealql.SelectOnly("notification").
		Field("*")
}

func getBaseNotificationQuery() *surrealql.SelectQuery {
	return surrealql.Select("notification").
		Field("*").
		Where("user = $userId").
		OrderByDesc("created_at")
}
