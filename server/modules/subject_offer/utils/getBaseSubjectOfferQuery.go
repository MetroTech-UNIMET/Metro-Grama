package utils

import (
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// getBaseSubjectOfferQuery constructs the query and params for annual offers combining optional filters.
// If enrollable is provided (non-empty), the query will restrict to those subject IDs.
func GetBaseSubjectOfferQuery(careers []surrealModels.RecordID, includeFriends bool) (*surrealql.SelectQuery, *surrealql.SelectQuery) {
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
		Where("in->belong->career ANYINSIDE ?", careers).
		Fetch("subject", "trimester", "prelations")

	if includeFriends {
		sections_Qb.
			Alias("friends", "$friends_PlanToSee.filter(|$v| $this.id INSIDE $v.plan_to_see)").
			Alias("friends_of_a_friend", "$friendOfAfriend_PlanToSee.filter(|$v| $this.id INSIDE $v.plan_to_see).{commonFriend, friendOfAfriend}")

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
