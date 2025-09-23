package services

import (
	"context"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"

	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

	"github.com/surrealdb/surrealdb.go"
)

// QueryAnnualOfferByYear returns subjects (curriculum period + offered trimesters) for the given careers and academic year.
func QueryAnnualOfferByYear(career surrealModels.RecordID, year string) ([]DTO.QueryAnnualOfferYear, error) {
	qb_SubQuery := surrealql.Select("subject_offer").
		Field("VALUE out").
		Where("in = $parent.in").
		Where("string::starts_with(record::id(out), $year)")

	subQueryString := "(" + qb_SubQuery.String() + ") AS trimesters"

	qb := surrealql.
		Select("belong").
		FieldNameAs("in", "subject").
		FieldNameAs("trimester", "period").
		Field(subQueryString).
		Where("? INSIDE ->career", career).
		OrderBy("period").
		Fetch("subject")

	params := map[string]any{
		"year": year,
	}

	sql, vars := qb.Build()

	if vars == nil {
		vars = map[string]any{}
	}
	for k, v := range params {
		vars[k] = v
	}

	res, err := surrealdb.Query[[]DTO.QueryAnnualOfferYear](context.Background(), db.SurrealDB, sql, vars)
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
