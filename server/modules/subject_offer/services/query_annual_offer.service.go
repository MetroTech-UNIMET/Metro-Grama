package services

import (
	"bytes"
	"context"
	"errors"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"
	subjectservices "metrograma/modules/subjects/services"
	"metrograma/tools"
	"net/http"
	"strings"
	"text/template"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Template to build the SELECT/FROM/FETCH parts with required careers filter and optional enrollment info.
// When a studentId is provided, ExtraSelects adds is_enrolled & is_enrollable fields.
const getAnnualOfferQueryTemplate = `
SELECT
	id, in as subject, out as trimester,
	(SELECT *,
        (SELECT * FROM subject_schedule 
            WHERE subject_section = $parent.id 
        ) as schedules
		FROM subject_section 
		WHERE subject_offer = $parent.id
        ORDER section_number ASC
	) AS sections,
	in->belong->career as careers,
	in->(precede
			WHERE out->belong->career ANYINSIDE $careers 
	).out as prelations{{.ExtraSelects}}
FROM subject_offer
WHERE in->belong->career ANYINSIDE $careers{{.ExtraWhere}}
FETCH subject, trimester, prelations;`

// buildAnnualOfferQuery constructs the query and params for annual offers combining optional filters.
// If enrollable is provided (non-empty), the query will restrict to those subject IDs.
func buildAnnualOfferQuery(trimesterId string, careers []surrealModels.RecordID, enrollable []surrealModels.RecordID, studentId *surrealModels.RecordID, enrolled []surrealModels.RecordID, subjectsFilter string) (string, map[string]any, error) {
	// Build dynamic extra WHERE clause parts (careers filter is always present in the template)
	whereParts := make([]string, 0, 3)
	params := map[string]any{}

	// careers is required and must contain at least one valid id
	if len(careers) == 0 {
		return "", nil, echo.NewHTTPError(http.StatusBadRequest, "careers debe contener al menos 1 carrera válida")
	}
	// Pass careers as a parameter; template has fixed filter
	params["careers"] = careers

	if trimesterId != "" {
		whereParts = append(whereParts, "out.id = $trimesterId")
		params["trimesterId"] = surrealModels.NewRecordID("trimester", trimesterId)
	}

	if subjectsFilter == "enrollable" && len(enrollable) > 0 {
		whereParts = append(whereParts, "in.id IN $enrollable")
		params["enrollable"] = enrollable
	}

	extraWhere := ""
	if len(whereParts) > 0 {
		extraWhere = " AND " + strings.Join(whereParts, " AND ")
	}

	// Dynamic additions when a student context is present. $enrolled is now supplied as a parameter (not via LET).
	extraSelects := ""
	if studentId != nil {
		params["studentId"] = *studentId
		params["enrolled"] = enrolled
		params["enrollable"] = enrollable
		extraSelects = ", in IN $enrolled as is_enrolled, in IN $enrollable as is_enrollable"
	}

	tmpl, err := template.New("annualOffer").Parse(getAnnualOfferQueryTemplate)
	if err != nil {
		return "", nil, err
	}
	var buf bytes.Buffer
	err = tmpl.Execute(&buf, struct {
		ExtraSelects string
		ExtraWhere   string
	}{
		ExtraSelects: extraSelects,
		ExtraWhere:   extraWhere,
	})
	if err != nil {
		return "", nil, err
	}
	return buf.String(), params, nil
}

// AnnualOfferQueryParams groups optional query params for annual offer queries
type AnnualOfferQueryParams struct {
	Careers        string
	SubjectsFilter string
}

// GetAllAnnualOffers retrieves all subject_offer edges with their related subject and trimester.
func GetAllAnnualOffers(careers string) ([]DTO.QueryAnnualOffer, error) {
	careersArray := tools.StringToIdArray(careers)
	if len(careersArray) == 0 {
		return nil, errors.New("careers debe contener al menos 1 carrera válida")
	}
	query, params, err := buildAnnualOfferQuery("", careersArray, nil, nil, nil, "none")
	if err != nil {
		return nil, err
	}
	result, err := surrealdb.Query[[]DTO.QueryAnnualOffer](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	offers := (*result)[0].Result
	return offers, nil
}

// GetAnnualOfferById retrieves subject_offer edges filtered by trimester ID.
func GetAnnualOfferById(trimesterId string, studentId surrealModels.RecordID, queryParams AnnualOfferQueryParams) ([]DTO.QueryAnnualOffer, error) {
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
		ids, err := subjectservices.GetEnrolledSubjects(studentId)
		if err != nil {
			return nil, err
		}
		enrolled = ids
	} else {
		studentPtr = nil
	}

	careersArray := tools.StringToIdArray(queryParams.Careers)
	if len(careersArray) == 0 {
		return nil, errors.New("careers debe contener al menos 1 carrera válida")
	}
	query, params, err := buildAnnualOfferQuery(trimesterId, careersArray, enrollable, studentPtr, enrolled, queryParams.SubjectsFilter)
	if err != nil {
		return nil, err
	}

	result, err := surrealdb.Query[[]DTO.QueryAnnualOffer](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	offers := (*result)[0].Result
	return offers, nil
}
