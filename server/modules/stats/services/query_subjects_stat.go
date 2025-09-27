package services

import (
	"context"
	"metrograma/db"
	DTO "metrograma/modules/stats/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// QuerySubjectStats returns aggregated stats per trimester for a subject.
func QuerySubjectStats(subjectId surrealModels.RecordID) ([]DTO.SubjectStat, error) {
	qb := surrealql.Select("enroll").Field(
		surrealql.Expr("count()").As("count"),
	).
		Field(
			surrealql.Expr("math::mean(difficulty)").As("difficulty"),
		).
		Field(
			surrealql.Expr("math::mean(grade)").As("grade"),
		).
		Field(
			surrealql.Expr("math::mean(workload)").As("workload"),
		).
		Field("trimester").
		FieldNameAs("trimester.starting_date", "date").
		WhereEq("out", subjectId).
		GroupBy("date").
		OrderBy("date")

	sql, vars := qb.Build()

	results, err := surrealdb.Query[[]DTO.SubjectStat](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return nil, err
	}

	stats := (*results)[0].Result

	return stats, nil
}
