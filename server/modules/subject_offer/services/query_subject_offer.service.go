package services

import (
	"context"
	"maps"
	"metrograma/db"
	enrollServices "metrograma/modules/interactions/enroll/services"
	"metrograma/modules/subject_offer/DTO"
	subjectservices "metrograma/modules/subjects/services"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// getBaseSubjectOfferQuery constructs the query and params for annual offers combining optional filters.
// If enrollable is provided (non-empty), the query will restrict to those subject IDs.
func getBaseSubjectOfferQuery(careers []surrealModels.RecordID, includeFriends bool) *surrealql.SelectQuery {
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

	if includeFriends {
		sections_Qb.Alias("differentFriends", `array::union(
				$friends_PlanToSee.filter(|$v| $this.id INSIDE $v.plan_to_see).id, 
				$friendOfAfriend_PlanToSee.filter(|$v| $this.id INSIDE $v.plan_to_see).friendOfAfriend
		).len()`)
		sections_Qb.Alias("friends", "$friends_PlanToSee.filter(|$v| $this.id INSIDE $v.plan_to_see)")
		sections_Qb.Alias("friends_of_a_friend", "$friendOfAfriend_PlanToSee.filter(|$v| $this.id INSIDE $v.plan_to_see).{commonFriend, friendOfAfriend}")
	}

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
		subjectOffer_Qb = subjectOffer_Qb.Fetch(
			"sections.friends",
			"sections.friends.user",

			"sections.friends_of_a_friend.commonFriend",
			"sections.friends_of_a_friend.commonFriend.user",
			"sections.friends_of_a_friend.friendOfAfriend",
			"sections.friends_of_a_friend.friendOfAfriend.user")
	}

	return subjectOffer_Qb
}

func constructTransactionVariables(qb *surrealql.TransactionQuery) *surrealql.TransactionQuery {
	friendsOfAfriend_Qb := surrealql.Select("$loggedUser.{2+path}(->friend->student)").
		Alias("commonFriend", "$this[0]").
		Alias("friendOfAfriend", "$this[1]").Where("$this[1] != $loggedUser")

	friendsOfAFriendPlanToSee_Qb := surrealql.Select("$friendsOfAfriend").
		Alias("commonFriend", "$this.commonFriend").
		Alias("friendOfAfriend", "$this.friendOfAfriend").
		Alias("plan_to_see", `<set>array::union(
				$course.principal_sections ?? [],
				$course.secondary_sections ?? [])`)

	friendsPlanToSee_Qb := surrealql.Select("$friends").
		Field("*").
		Alias("plan_to_see", `<set>array::union(
				$course.principal_sections ?? [],
				$course.secondary_sections ?? [])`)

	qb = qb.
		Let("friendsOfAfriend", friendsOfAfriend_Qb).
		Let("course", surrealql.Expr("$friendsOfAfriend.friendOfAfriend->(course WHERE out = $trimester)[0][0]")).
		Let("friendOfAfriend_PlanToSee", friendsOfAFriendPlanToSee_Qb).
		Let("friends", surrealql.Expr("$loggedUser->friend->student")).
		Let("friendCourse", surrealql.Expr("$friends->(course WHERE out = $trimester)[0][0]")).
		Let("friends_PlanToSee", friendsPlanToSee_Qb)

	return qb
}

// AnnualOfferQueryParams groups optional query params for annual offer queries
type AnnualOfferQueryParams struct {
	Careers        string
	SubjectsFilter string
}

// GetAllSubjectOffers retrieves all subject_offer edges with their related subject and trimester.
func GetAllSubjectOffers(careers string) ([]DTO.QueryAnnualOffer, error) {
	careersArray := tools.StringToIdArray(careers)
	// careers is required and must contain at least one valid id
	if len(careersArray) == 0 {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "careers debe contener al menos 1 carrera válida")
	}

	qb := getBaseSubjectOfferQuery(careersArray, false)
	query, params := qb.Build()

	result, err := surrealdb.Query[[]DTO.QueryAnnualOffer](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	offers := (*result)[0].Result
	return offers, nil
}

// GetSubjectOfferById retrieves subject_offer edges filtered by trimester ID.
func GetSubjectOfferById(trimesterId string, studentId surrealModels.RecordID, queryParams AnnualOfferQueryParams) ([]DTO.QueryAnnualOffer, error) {
	isUserLogged := studentId != (surrealModels.RecordID{})

	var enrollable []surrealModels.RecordID
	// Fetch enrollable subjects if requested or if student context is present
	if queryParams.SubjectsFilter == "enrollable" || (isUserLogged && queryParams.SubjectsFilter == "none") {
		ids, err := subjectservices.GetEnrollableSubjects(studentId)
		if err != nil {
			return nil, err
		}
		if len(ids) == 0 { // explicit enrollable filter but no enrollables
			return []DTO.QueryAnnualOffer{}, nil
		}
		enrollable = ids
	}

	// Always fetch enrolled subjects (passed=true) via subjectservices when student present
	var enrolled []surrealModels.RecordID
	studentPtr := &studentId
	if isUserLogged {
		ids, err := enrollServices.GetPassedSubjectsIds(studentId)
		if err != nil {
			return nil, err
		}
		enrolled = ids
	} else {
		studentPtr = nil
	}

	careersArray := tools.StringToIdArray(queryParams.Careers)
	// careers is required and must contain at least one valid id
	if len(careersArray) == 0 {
		return nil, echo.NewHTTPError(http.StatusBadRequest, "careers debe contener al menos 1 carrera válida")
	}

	extraParams := make(map[string]any)
	qb := surrealql.Begin()
	if isUserLogged {
		// TODO - USar studeint id y pasarlo a params
		qb = constructTransactionVariables(qb)
		extraParams["loggedUser"] = studentId
	}

	subjectOffer_Qb := getBaseSubjectOfferQuery(careersArray, isUserLogged)

	if trimesterId != "" {
		subjectOffer_Qb = subjectOffer_Qb.Where("out.id = $trimester")
		extraParams["trimester"] = surrealModels.NewRecordID("trimester", trimesterId)
		// subjectOffer_Qb = subjectOffer_Qb.Where("out.id = ?", surrealModels.NewRecordID("trimester", trimesterId))
	}

	if queryParams.SubjectsFilter == "enrollable" && len(enrollable) > 0 {
		subjectOffer_Qb = subjectOffer_Qb.Where("in.id IN ?", enrollable)
	}

	if studentPtr != nil {
		subjectOffer_Qb = subjectOffer_Qb.
			Alias("is_enrolled", "in IN ?", enrolled).
			Alias("is_enrollable", "in IN ?", enrollable)
	}
	qb = qb.Return("?", subjectOffer_Qb)

	query, params := qb.Build()

	maps.Copy(params, extraParams)

	result, err := surrealdb.Query[[]DTO.QueryAnnualOffer](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	offers := (*result)[0].Result
	return offers, nil
}

// Como conseguir amigos que quieren ver la materia:
// 1. Si el usuario es amigo, chequear si ShowSchedule es onlyFriends o public
// 1.5. Si el usuario es amigo de un amigo, chequear si ShowSchedule es friendsFriends o public
// 2. Si cumplen, chequear course (principal y secondary) en el mismo trimestre del query
// 3. Si cumple todo lo de arriba, devolver amigo y sección. Si es amigo de un amigo, agregar commonFriend
