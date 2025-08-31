package services

import (
	"bytes"
	"context"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Template for querying annual offers, with optional trimester filter
const getAnnualOfferQueryTemplate = `SELECT id, in as subject, out as trimester,
	(SELECT * FROM subject_schedule WHERE subject_offer = $parent.id) AS schedules
FROM subject_offer
{{if .HasTrimester}}WHERE out.id = $trimesterId{{end}}
FETCH subject, trimester;`

// buildAnnualOfferQuery constructs the query and params for annual offers
func buildAnnualOfferQuery(trimesterId string) (string, map[string]any, error) {
	tmpl, err := template.New("annualOffer").Parse(getAnnualOfferQueryTemplate)
	if err != nil {
		return "", nil, err
	}
	var buf bytes.Buffer
	err = tmpl.Execute(&buf, struct{ HasTrimester bool }{HasTrimester: trimesterId != ""})
	if err != nil {
		return "", nil, err
	}
	params := map[string]any{}
	if trimesterId != "" {
		params["trimesterId"] = surrealModels.NewRecordID("trimester", trimesterId)
	}
	return buf.String(), params, nil
}

// GetAllAnnualOffers retrieves all subject_offer edges with their related subject and trimester.
func GetAllAnnualOffers() ([]DTO.QueryAnnualOffer, error) {
	query, params, err := buildAnnualOfferQuery("")
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
func GetAnnualOfferById(trimesterId string) ([]DTO.QueryAnnualOffer, error) {
	query, params, err := buildAnnualOfferQuery(trimesterId)
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
