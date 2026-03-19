package services

import (
	"context"
	"metrograma/db"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetEnrolledSubjectsOptions allows customizing the query.
type GetEnrolledSubjectsOptions struct {
	// OnlyPassed filters enrollments with grade >= 10 when true.
	OnlyPassed bool
}

func GetEnrolledSubjects(ctx context.Context, studentId surrealModels.RecordID, opts ...GetEnrolledSubjectsOptions) ([]string, error) {
	qb := surrealql.Select("enroll").Field("VALUE <string>out").Where("in == ?", studentId)
	if len(opts) > 0 && opts[0].OnlyPassed {
		qb = qb.Where("grade >= 10")
	}
	sql, vars := qb.Build()

	res, err := surrealdb.Query[[]string](ctx, db.SurrealDB, sql, vars)

	if err != nil {
		return []string{}, err
	}

	subjects, err := tools.SafeResult(res, 0)
	if err != nil {
		return []string{}, nil
	}

	return subjects, nil
}

func GetPassedSubjectsIds(ctx context.Context, studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	qb := GetEnrolledSubjectsQuery()

	sql, vars := qb.Build()
	vars["studentId"] = studentId

	res, err := surrealdb.Query[[]surrealModels.RecordID](ctx, db.SurrealDB, sql, vars)

	if err != nil {
		return []surrealModels.RecordID{}, err
	}

	subjects, err := tools.SafeResult(res, 0)
	if err != nil {
		return []surrealModels.RecordID{}, nil
	}

	return subjects, nil
}

// getEnrollableSubjects returns the list of subject RecordIDs that are enrollable for a given student.
// It runs a transaction in SurrealDB utilizing a helper function fn::is_subject_enrollable.
func GetEnrollableSubjects(ctx context.Context, studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	qb := surrealql.Begin().
		Let("enrolled", GetEnrolledSubjectsQuery()).
		Return("?", GetEnrollableSubjectsQuery())

	sql, params := qb.Build()
	params["studentId"] = studentId

	res, err := surrealdb.Query[[]surrealModels.RecordID](ctx, db.SurrealDB, sql, params)
	if err != nil {
		return nil, err
	}
	// Por alguna razon antes era -1 y ahora tiene que ser -2
	ids, err := tools.SafeResult(res, -2)
	if err != nil {
		return []surrealModels.RecordID{}, nil
	}
	if ids == nil {
		return []surrealModels.RecordID{}, nil
	}
	return ids, nil
}

func GetEnrolledSubjectsQuery() *surrealql.SelectQuery {
	return surrealql.Select("enroll").
		Value("out").
		Where("in = $studentId").
		Where("grade >= 10")
}

func GetEnrollableSubjectsQuery() *surrealql.SelectQuery {
	return surrealql.
		Select("subject").
		Value("id").
		// TODO - Por la porqueria de 3.x.x por ahora $enrolled tiene que ser un array
		Where("fn::is_subject_enrollable(id, $studentId, $enrolled.distinct()) = true")
}
