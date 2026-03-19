package services

import (
	"context"
	"metrograma/db"
	"metrograma/tools"

	surrealdb "github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetStudentCareers returns the career record IDs linked to a student through the study relation
func GetStudentCareers(ctx context.Context, studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	qb := surrealql.SelectOnly(studentId).
		Value("->study.out")

	sql, params := qb.Build()

	res, err := surrealdb.Query[[]surrealModels.RecordID](ctx, db.SurrealDB, sql, params)
	if err != nil {
		return nil, err
	}
	careers, err := tools.SafeResult(res, 0)
	if err != nil {
		return []surrealModels.RecordID{}, nil
	}

	if careers == nil {
		return []surrealModels.RecordID{}, nil
	}
	return careers, nil
}
