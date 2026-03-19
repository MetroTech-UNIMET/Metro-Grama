package utils

import (
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// getBaseSubjectOfferQuery constructs the query and params for annual offers combining optional filters.
func GetBaseSubjectOfferQuery(careers []surrealModels.RecordID, includeFriends bool, includeElectives bool) (*surrealql.SelectQuery, *surrealql.SelectQuery) {
	whereCondition := ""
	hasCareers := len(careers) > 0
	if hasCareers {
		whereCondition = "in->belong->career ANYINSIDE ?"
	}
	if includeElectives {
		if whereCondition != "" {
			whereCondition += " OR "
		}
		whereCondition += "in.isElective = true"
	}
	if whereCondition != "" {
		whereCondition = "(" + whereCondition + ")"
	}

	schedules_Qb := surrealql.
		Select("subject_schedule").
		Field("*").
		Where("subject_section = $parent.id")

	sections_Qb := surrealql.
		Select("subject_section").
		Field("*").
		Alias("schedules", schedules_Qb).
		Where("subject_offer = $parent.id").
		OrderBy("section_number")

	subjectOffer_Qb := surrealql.Select("subject_offer").
		Field("id").
		FieldNameAs("in", "subject").
		FieldNameAs("out", "trimester").
		Alias("sections", sections_Qb).
		Alias("careers", "in->belong->career").
		Alias("prelations", `in->(precede
					WHERE out->belong->career ANYINSIDE  ?
				).out`, careers).
		Fetch("subject", "trimester", "prelations")

	if whereCondition != "" {
		if hasCareers {
			subjectOffer_Qb = subjectOffer_Qb.Where(whereCondition, careers)
		} else {
			subjectOffer_Qb = subjectOffer_Qb.Where(whereCondition)
		}
	}

	if includeFriends {
		friendsFieldQuery := surrealql.
			Select("$friends_PlanToSee").
			Where("$parent.id INSIDE plan_to_see")

		friendsOfAFriendFieldQuery := surrealql.
			Select("$friendOfAfriend_PlanToSee").
			Field("commonFriend").
			Field("friendOfAfriend").Where("$parent.id INSIDE plan_to_see")

		sections_Qb.
			Alias("friends", friendsFieldQuery).
			Alias("friends_of_a_friend", friendsOfAFriendFieldQuery)

		friends_PTS_Qb := surrealql.Select("$friends_PlanToSee").
			Value("id").
			Where("$parent.in IN plan_to_see.subject_offer.in")

		friendOfAfriend_PTS_Qb := surrealql.Select("$friendOfAfriend_PlanToSee").
			Value("commonFriend").
			Where("$parent.in IN plan_to_see.subject_offer.in")

		subjectOffer_Qb = subjectOffer_Qb.
			Alias("differentFriends", "array::union(?,  ?).len()", friends_PTS_Qb, friendOfAfriend_PTS_Qb).
			Fetch(
				"sections.friends",
				"sections.friends.user",

				"sections.friends_of_a_friend.commonFriend",
				"sections.friends_of_a_friend.commonFriend.user",
				"sections.friends_of_a_friend.friendOfAfriend",
				"sections.friends_of_a_friend.friendOfAfriend.user")
	}

	return subjectOffer_Qb, sections_Qb
}
