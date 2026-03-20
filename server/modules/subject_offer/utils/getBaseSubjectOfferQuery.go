package utils

import (
	"strings"

	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// getBaseSubjectOfferQuery constructs the query and params for annual offers combining optional filters.
func GetBaseSubjectOfferQuery(careers []surrealModels.RecordID, includeFriends bool, includeElectives bool) (*surrealql.SelectQuery, *surrealql.SelectQuery) {
	whereCondition := buildSubjectOfferWhereCondition(len(careers) > 0, includeElectives)

	sectionsQuery := buildSectionsQuery()
	subjectOfferQuery := buildSubjectOfferProjectionQuery(sectionsQuery, careers)
	subjectOfferQuery = applySubjectOfferWhereCondition(subjectOfferQuery, whereCondition, careers)

	if includeFriends {
		subjectOfferQuery = applyFriendsEnrichment(subjectOfferQuery, sectionsQuery)
	}

	return subjectOfferQuery, sectionsQuery
}

func buildSectionsQuery() *surrealql.SelectQuery {
	schedulesQuery := surrealql.
		Select("subject_schedule").
		Field("*").
		Where("subject_section = $parent.id")

	return surrealql.
		Select("subject_section").
		Field("*").
		Alias("schedules", schedulesQuery).
		Where("subject_offer = $parent.id").
		OrderBy("section_number")
}

func buildComputedSubjectOfferQuery() *surrealql.SelectQuery {
	friendsPlanToSeeQuery := surrealql.Select("$friends_PlanToSee").
		Value("id").
		Where("$parent.in IN plan_to_see.subject_offer.in")

	friendOfAFriendPlanToSeeQuery := surrealql.Select("$friendOfAfriend_PlanToSee").
		Value("commonFriend").
		Where("$parent.in IN plan_to_see.subject_offer.in")

	return surrealql.
		Select("subject_offer").
		Field("*").
		Alias("differentFriends", "array::union(?,  ?).len()", friendsPlanToSeeQuery, friendOfAFriendPlanToSeeQuery)
}

func buildSubjectOfferProjectionQuery(sectionsQuery *surrealql.SelectQuery, careers []surrealModels.RecordID) *surrealql.SelectQuery {
	return surrealql.Select(buildComputedSubjectOfferQuery()).
		Field("id").
		FieldNameAs("in", "subject").
		FieldNameAs("out", "trimester").
		Alias("sections", sectionsQuery).
		Alias("careers", "in->belong->career").
		Alias("prelations", `in->(precede
					WHERE out->belong->career ANYINSIDE  ?
				).out`, careers).
		Fetch("subject", "trimester", "prelations")
}

func applySubjectOfferWhereCondition(subjectOfferQuery *surrealql.SelectQuery, whereCondition string, careers []surrealModels.RecordID) *surrealql.SelectQuery {
	if whereCondition == "" {
		return subjectOfferQuery
	}

	if len(careers) > 0 {
		return subjectOfferQuery.Where(whereCondition, careers)
	}

	return subjectOfferQuery.Where(whereCondition)
}

func applyFriendsEnrichment(subjectOfferQuery *surrealql.SelectQuery, sectionsQuery *surrealql.SelectQuery) *surrealql.SelectQuery {
	friendsFieldQuery := surrealql.
		Select("$friends_PlanToSee").
		Where("$parent.id INSIDE plan_to_see")

	friendsOfAFriendFieldQuery := surrealql.
		Select("$friendOfAfriend_PlanToSee").
		Field("commonFriend").
		Field("friendOfAfriend").Where("$parent.id INSIDE plan_to_see")

	sectionsQuery.
		Alias("friends", friendsFieldQuery).
		Alias("friends_of_a_friend", friendsOfAFriendFieldQuery)

	return subjectOfferQuery.
		Field("differentFriends").
		Fetch(
			"sections.friends",
			"sections.friends.user",

			"sections.friends_of_a_friend.commonFriend",
			"sections.friends_of_a_friend.commonFriend.user",
			"sections.friends_of_a_friend.friendOfAfriend",
			"sections.friends_of_a_friend.friendOfAfriend.user")
}

func buildSubjectOfferWhereCondition(hasCareers bool, includeElectives bool) string {
	conditions := make([]string, 0, 2)

	if hasCareers {
		conditions = append(conditions, "in->belong->career ANYINSIDE ?")
	}
	if includeElectives {
		conditions = append(conditions, "in.isElective = true")
	}
	if len(conditions) == 0 {
		return ""
	}

	return "(" + strings.Join(conditions, " OR ") + ")"
}
