package services

import (
	"context"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

	"github.com/surrealdb/surrealdb.go"
)

// TODO - Filtar aquellas que tienen trimesters vacíos
// Surreal query to get the annual offer (subjects with their curriculum period and the trimesters
// where they are offered in the specified academic year).
// $career : record<career>
// $year   : string (e.g. "2425")
const queryAnnualOfferYear = `
SELECT in as subject, trimester as period,
    (SELECT VALUE out FROM subject_offer
        WHERE in = $parent.in AND string::starts_with(record::id(out), $year)) AS trimesters
FROM belong
WHERE $career INSIDE ->career
ORDER BY period
FETCH subject;`

// QueryAnnualOfferByYear returns subjects (curriculum period + offered trimesters) for the given careers and academic year.
func QueryAnnualOfferByYear(career surrealModels.RecordID, year string) ([]DTO.QueryAnnualOfferYear, error) {

	params := map[string]any{
		"career": career,
		"year":   year,
	}
	res, err := surrealdb.Query[[]DTO.QueryAnnualOfferYear](context.Background(), db.SurrealDB, queryAnnualOfferYear, params)
	if err != nil {
		return nil, err
	}
	// Surreal returns an array of statements; we have one statement.
	statement := (*res)[0]
	// Ensure slice is non-nil
	offers := statement.Result
	if offers == nil {
		offers = []DTO.QueryAnnualOfferYear{}
	}
	return offers, nil
}
