package services

import (
	"context"
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

// getBaseSubjectOfferQuer constructs the query and params for annual offers combining optional filters.
// If enrollable is provided (non-empty), the query will restrict to those subject IDs.
func getBaseSubjectOfferQuer(careers []surrealModels.RecordID) *surrealql.SelectQuery {
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

	qb := surrealql.Select("subject_offer").
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

	qb := getBaseSubjectOfferQuer(careersArray)
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
	var enrollable []surrealModels.RecordID
	// Fetch enrollable subjects if requested or if student context is present
	if queryParams.SubjectsFilter == "enrollable" || (studentId != (surrealModels.RecordID{}) && queryParams.SubjectsFilter == "none") {
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
	if studentId != (surrealModels.RecordID{}) {
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

	qb := getBaseSubjectOfferQuer(careersArray)

	if trimesterId != "" {
		qb = qb.Where("out.id = ?", surrealModels.NewRecordID("trimester", trimesterId))
	}

	if queryParams.SubjectsFilter == "enrollable" && len(enrollable) > 0 {
		qb = qb.Where("in.id IN ?", enrollable)
	}

	if studentPtr != nil {
		qb = qb.
			Alias("is_enrolled", "in IN ?", enrolled).
			Alias("is_enrollable", "in IN ?", enrollable)
	}

	query, params := qb.Build()

	result, err := surrealdb.Query[[]DTO.QueryAnnualOffer](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	offers := (*result)[0].Result
	return offers, nil
}
