package services

import (
	"bytes"
	"context"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"
	subjectservices "metrograma/modules/subjects/services"
	"metrograma/tools"
	"strings"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Template kept only to build the fixed SELECT/FROM/FETCH parts without WHERE logic
const getAnnualOfferQueryTemplate = `SELECT
	id, in as subject, out as trimester,
	(SELECT *,
        (SELECT * FROM subject_schedule WHERE subject_section = $parent.id) as schedules
		FROM subject_section 
		WHERE subject_offer = $parent.id
	) AS sections,
	in->belong->career as careers
FROM subject_offer
{{.WhereClause}}
FETCH subject, trimester;`

// buildAnnualOfferQuery constructs the query and params for annual offers combining optional filters.
// If enrollable is provided (non-empty), the query will restrict to those subject IDs.
func buildAnnualOfferQuery(trimesterId string, careers string, enrollable []surrealModels.RecordID) (string, map[string]any, error) {
	// Build dynamic WHERE clause respecting single WHERE keyword
	whereParts := make([]string, 0, 3)
	params := map[string]any{}

	if trimesterId != "" {
		whereParts = append(whereParts, "out.id = $trimesterId")
		params["trimesterId"] = surrealModels.NewRecordID("trimester", trimesterId)
	}

	careersArray := []surrealModels.RecordID{}
	if careers != "" {
		// Expecting CSV of record IDs like career:ING,career:CS...
		careersArray = tools.StringToIdArray(careers)
	}
	if len(careersArray) > 0 {
		whereParts = append(whereParts, "in->belong->career ANYINSIDE $careers")
		params["careers"] = careersArray
	}

	if len(enrollable) > 0 {
		whereParts = append(whereParts, "in.id IN $enrollable")
		params["enrollable"] = enrollable
	}

	whereClause := ""
	if len(whereParts) > 0 {
		whereClause = " WHERE " + strings.Join(whereParts, " AND ")
	}

	tmpl, err := template.New("annualOffer").Parse(getAnnualOfferQueryTemplate)
	if err != nil {
		return "", nil, err
	}
	var buf bytes.Buffer
	err = tmpl.Execute(&buf, struct{ WhereClause string }{WhereClause: whereClause})
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
	query, params, err := buildAnnualOfferQuery("", careers, nil)
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
	if queryParams.SubjectsFilter == "enrollable" {

		ids, err := subjectservices.GetEnrollableSubjects(studentId)
		if err != nil {
			return nil, err
		}
		if len(ids) == 0 {
			// No enrollable subjects => return empty set quickly
			return []DTO.QueryAnnualOffer{}, nil
		}
		enrollable = ids
	}

	query, params, err := buildAnnualOfferQuery(trimesterId, queryParams.Careers, enrollable)
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
