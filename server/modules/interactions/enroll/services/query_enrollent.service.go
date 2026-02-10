package services

import (
	"context"
	"metrograma/db"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetEnrolledSubjectsOptions allows customizing the query.
type GetEnrolledSubjectsOptions struct {
	// OnlyPassed filters enrollments with grade >= 10 when true.
	OnlyPassed bool
}

func GetEnrolledSubjects(studentId surrealModels.RecordID, opts ...GetEnrolledSubjectsOptions) ([]string, error) {
	qb := surrealql.Select("enroll").Field("VALUE <string>out").Where("in == ?", studentId)
	if len(opts) > 0 && opts[0].OnlyPassed {
		qb = qb.Where("grade >= 10")
	}
	sql, vars := qb.Build()

	query, err := surrealdb.Query[[]string](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return []string{}, err
	}

	subjects := (*query)[0].Result

	return subjects, nil
}

func GetPassedSubjectsIds(studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	qb := surrealql.Select("enroll").Field("VALUE out").Where("in == ?", studentId).Where("grade >= 10")

	sql, vars := qb.Build()

	query, err := surrealdb.Query[[]surrealModels.RecordID](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return []surrealModels.RecordID{}, err
	}

	subjects := (*query)[0].Result

	return subjects, nil
}
