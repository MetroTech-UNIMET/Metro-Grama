package services

import (
	"bytes"
	"context"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"
	"metrograma/tools"
	"strings"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Template kept only to build the fixed SELECT/FROM/FETCH parts without WHERE logic
const getAnnualOfferQueryTemplate = `SELECT
	id, in as subject, out as trimester,
	(SELECT * 
		FROM subject_schedule 
		WHERE subject_offer = $parent.id
	) AS schedules,
	in->belong->career as careers
FROM subject_offer
{{.WhereClause}}
FETCH subject, trimester;`

// buildAnnualOfferQuery constructs the query and params for annual offers combining optional filters.
func buildAnnualOfferQuery(trimesterId string, careers string) (string, map[string]any, error) {
	// Build dynamic WHERE clause respecting single WHERE keyword
	whereParts := make([]string, 0, 2)
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

// GetAllAnnualOffers retrieves all subject_offer edges with their related subject and trimester.
func GetAllAnnualOffers(careers string) ([]DTO.QueryAnnualOffer, error) {
	query, params, err := buildAnnualOfferQuery("", careers)
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
func GetAnnualOfferById(trimesterId string, careers string) ([]DTO.QueryAnnualOffer, error) {
	query, params, err := buildAnnualOfferQuery(trimesterId, careers)
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
