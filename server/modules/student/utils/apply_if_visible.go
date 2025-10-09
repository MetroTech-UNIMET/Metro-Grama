package utils

import (
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func shouldAllowByVisibility[V ~string](
	loggedUserId *surrealModels.RecordID,
	visibility V,
	isFriend bool,
	isFriendOfAFriend bool,
) bool {
	// Preserve current behavior: guests (nil logged user) see it regardless of visibility.
	if loggedUserId == nil {
		return true
	}
	switch string(visibility) {
	case "public":
		return true
	case "onlyFriends":
		return isFriend
	case "friendsFriends":
		return isFriendOfAFriend
	default:
		return false
	}
}

// ApplyIfVisible runs apply(qb) only when ShouldAllowByVisibility returns true.
func ApplyIfVisible[V ~string](
	qb *surrealql.SelectQuery,
	loggedUserId *surrealModels.RecordID,
	visibility V,
	isFriend bool,
	isFriendOfAFriend bool,
	apply func(*surrealql.SelectQuery) *surrealql.SelectQuery,
) *surrealql.SelectQuery {
	if shouldAllowByVisibility(loggedUserId, visibility, isFriend, isFriendOfAFriend) {
		return apply(qb)
	}
	return qb
}
