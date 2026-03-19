package services

import (
	"context"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"
	"metrograma/tools"
	"sort"

	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

	"github.com/surrealdb/surrealdb.go"
)

// QueryAnnualOfferByYear returns subjects (curriculum period + offered trimesters) for the given filters and academic year.
func QueryAnnualOfferByYear(ctx context.Context, career *surrealModels.RecordID, year string, queryParams DTO.AnnualOfferByYearQueryParams) ([]DTO.QueryAnnualOfferYear, error) {
	includeElectives := false
	if queryParams.IncludeElectives != nil {
		includeElectives = *queryParams.IncludeElectives
	}

	qb_SubQuery := surrealql.Select("subject_offer").
		Field("VALUE out").
		Where("in = $parent.id").
		Where("string::starts_with(record::id(out), $year)")

	orCondition := ""
	if career != nil {
		orCondition = "$career INSIDE ->belong.out"
	}
	if includeElectives {
		if orCondition != "" {
			orCondition += " OR "
		}
		orCondition += "isElective = true"
	}

	qb2 := surrealql.
		Select("subject").
		FieldNameAs("$this", "subject").
		Alias("period", "(->belong[WHERE $career = out].trimester)[0]").
		Alias("trimesters", qb_SubQuery).
		Where(orCondition).
		OrderBy("period")

	// qb := surrealql.
	// 	Select("belong").
	// 	FieldNameAs("in", "subject").
	// 	FieldNameAs("trimester", "period").
	// 	Field(surrealql.Expr(qb_SubQuery).As("trimesters")).
	// 	OrderBy("period").
	// 	Fetch("subject")

	// if career != nil {
	// 	qb = qb.Where("? INSIDE ->career"+orCondition, *career)
	// } else if includeElectives {
	// 	qb = qb.Where("in.isElective = true")
	// }

	params := map[string]any{
		"year":   year,
		"career": career,
	}

	sql, vars := qb2.Build()

	if vars == nil {
		vars = map[string]any{}
	}
	for k, v := range params {
		vars[k] = v
	}

	res, err := surrealdb.Query[[]DTO.QueryAnnualOfferYear](ctx, db.SurrealDB, sql, vars)
	if err != nil {
		return nil, err
	}
	offers, err := tools.SafeResult(res, 0)
	if err != nil {
		return []DTO.QueryAnnualOfferYear{}, nil
	}

	if offers == nil {
		offers = []DTO.QueryAnnualOfferYear{}
	}

	// FIXME - Como ahora surrealDB no ordena, tengo que hacerl yo >:v
	sort.SliceStable(offers, func(i, j int) bool {
		return offers[i].Period < offers[j].Period
	})

	return offers, nil
}
