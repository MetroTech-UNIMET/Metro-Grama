package services

import (
	"context"
	"fmt"
	"maps"
	"metrograma/db"
	enrollServices "metrograma/modules/interactions/enroll/services"
	"metrograma/modules/subject_offer/DTO"
	"metrograma/modules/subject_offer/utils"
	subjectservices "metrograma/modules/subjects/services"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

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

	qb, _ := utils.GetBaseSubjectOfferQuery(careersArray, false)
	query, params := qb.Build()

	result, err := surrealdb.Query[[]DTO.QueryAnnualOffer](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	offers := (*result)[0].Result
	return offers, nil
}

// GetSubjectOfferById retrieves subject_offer edges filtered by trimester ID.
func GetSubjectOfferById(trimesterId string, studentId surrealModels.RecordID, queryParams AnnualOfferQueryParams) ([]DTO.QueryAnnualOfferWithPlanning, error) {
	isUserLogged := studentId != (surrealModels.RecordID{})

	var enrollable []surrealModels.RecordID
	// Fetch enrollable subjects if requested or if student context is present
	if queryParams.SubjectsFilter == "enrollable" || (isUserLogged && queryParams.SubjectsFilter == "none") {
		ids, err := subjectservices.GetEnrollableSubjects(studentId)
		if err != nil {
			return nil, err
		}
		if len(ids) == 0 { // explicit enrollable filter but no enrollables
			return []DTO.QueryAnnualOfferWithPlanning{}, nil
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
		qb = utils.ConstructTransactionVariables(qb)
		extraParams["loggedUser"] = studentId
	}

	subjectOffer_Qb, sections_Qb := utils.GetBaseSubjectOfferQuery(careersArray, isUserLogged)

	sections_Qb.
		Alias("students_planning_to_enroll", "COUNT(?)",
			surrealql.
				Select("course").
				Value("id").
				Where("$parent.id IN array::concat(principal_sections,secondary_sections)"),
		).
		Alias("last_student_editor",
			surrealql.SelectOnly("subject_section_history").
				Value(
					surrealql.SelectOnly("student").
						Field("*").
						Where("user = $parent.user_id").
						Fetch("user"),
				).
				Where("end_date = None").
				Where("subject_section = $parent.id"),
		)

	if trimesterId != "" {
		subjectOffer_Qb = subjectOffer_Qb.Where("out.id = $trimester")
		extraParams["trimester"] = surrealModels.NewRecordID("trimester", trimesterId)
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
	fmt.Println("Generated Query:", query)

	maps.Copy(params, extraParams)

	result, err := surrealdb.Query[[]DTO.QueryAnnualOfferWithPlanning](context.Background(), db.SurrealDB, query, params)
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
