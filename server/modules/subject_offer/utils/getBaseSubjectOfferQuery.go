package utils

import (
	"strings"

	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// getBaseSubjectOfferQuery constructs the query and params for annual offers combining optional filters.
func GetBaseSubjectOfferQuery(careers []surrealModels.RecordID, isUserLogged bool, includeElectives bool) (*surrealql.SelectQuery, *surrealql.SelectQuery) {
	whereCondition := buildSubjectOfferWhereCondition(len(careers) > 0, includeElectives)

	sections_Qb := buildSectionsQuery()
	subjectOffer_Qb := buildSubjectOfferProjectionQuery(sections_Qb, careers)
	subjectOffer_Qb = applySubjectOfferWhereCondition(subjectOffer_Qb, whereCondition, careers)

	if isUserLogged {
		subjectOffer_Qb = applyFriendsEnrichment(subjectOffer_Qb, sections_Qb)
		subjectOffer_Qb = applySchedulePreferencesEnrichment(subjectOffer_Qb)
	}

	return subjectOffer_Qb, sections_Qb
}

func buildSectionsQuery() *surrealql.SelectQuery {
	schedules_Qb := surrealql.
		Select("subject_schedule").
		Field("*").
		Where("subject_section = $parent.id")

	return surrealql.
		Select("subject_section").
		Field("*").
		Alias("schedules", schedules_Qb).
		Where("subject_offer = $parent.id").
		OrderBy("section_number")
}

func buildComputedSubjectOfferQuery(sectionsQuery *surrealql.SelectQuery) *surrealql.SelectQuery {
	friendsPlanToSee_Qb := surrealql.Select("$friends_PlanToSee").
		Value("id").
		Where("$parent.in IN plan_to_see.subject_offer.in")

	friendOfAFriendPlanToSee_Qb := surrealql.Select("$friendOfAfriend_PlanToSee").
		Value("commonFriend").
		Where("$parent.in IN plan_to_see.subject_offer.in")

	enroll_Qb := surrealql.SelectOnly("enroll").
		Alias("avg_difficulty", "math::mean(difficulty ?: [0])").
		Alias("avg_grade", "math::mean(grade ?: [0])").
		Alias("avg_workload", "math::mean(workload ?: [0])").
		Field("out").
		Where("out=$parent.in AND trimester IN fn::previous_trimesters($parent.out, 3).id").
		GroupBy("out")

	return surrealql.
		Select("subject_offer").
		Field("*").
		Alias("sections", sectionsQuery).
		Alias("enroll", enroll_Qb).
		Alias("differentFriends", "array::union(?,  ?).len()", friendsPlanToSee_Qb, friendOfAFriendPlanToSee_Qb)
}

func buildSubjectOfferProjectionQuery(sectionsQuery *surrealql.SelectQuery, careers []surrealModels.RecordID) *surrealql.SelectQuery {
	return surrealql.Select(buildComputedSubjectOfferQuery(sectionsQuery)).
		Field("id").
		FieldNameAs("in", "subject").
		FieldNameAs("out", "trimester").
		Field("sections").
		Alias("careers", "in->belong->career").
		Alias("prelations", `in->(precede
					WHERE out->belong->career ANYINSIDE  ?
				).out`, careers).
		Alias("avg_difficulty", "enroll.avg_difficulty").
		Alias("avg_grade", "enroll.avg_grade").
		Alias("avg_workload", "enroll.avg_workload").
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

func applySchedulePreferencesEnrichment(subjectOfferQuery *surrealql.SelectQuery) *surrealql.SelectQuery {
	allProhibitedQuery := surrealql.Expr(`
		array::len(sections) > 0 AND array::all(sections, |$section| 
			array::len($section.schedules) > 0 AND array::all($section.schedules, |$schedule| 
				array::any($studentPreferences.schedulePreferences.prohibited_schedules, |$prohibited| 
					$schedule.day_of_week = $prohibited.day_of_week AND
					($schedule.starting_hour * 60 + $schedule.starting_minute) < ($prohibited.ending_hour * 60 + $prohibited.ending_minute) AND
					($schedule.ending_hour * 60 + $schedule.ending_minute) > ($prohibited.starting_hour * 60 + $prohibited.starting_minute)
				)
			)
		)`)

	hasPreferredScheduleQuery := surrealql.Expr(`
		array::any(sections, |$section| 
			array::any($section.schedules, |$schedule| 
				array::any($studentPreferences.schedulePreferences.preferred_schedules, |$preferred| 
					$schedule.day_of_week = $preferred.day_of_week AND
					($schedule.starting_hour * 60 + $schedule.starting_minute) >= ($preferred.starting_hour * 60 + $preferred.starting_minute) AND
					($schedule.ending_hour * 60 + $schedule.ending_minute) <= ($preferred.ending_hour * 60 + $preferred.ending_minute)
				)
			)
		)`)

	return subjectOfferQuery.
		Alias("allProhibited", allProhibitedQuery).
		Alias("hasPreferredSchedule", hasPreferredScheduleQuery)
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
