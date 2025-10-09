package services

import (
	"context"
	"metrograma/db"

	surrealdb "github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetStudentCareers returns the career record IDs linked to a student through the study relation
func GetStudentCareers(studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	qb := surrealql.SelectOnly(studentId).
		Value("->study.out")

	sql, params := qb.Build()

	res, err := surrealdb.Query[[]surrealModels.RecordID](context.Background(), db.SurrealDB, sql, params)
	if err != nil {
		return nil, err
	}
	if res == nil || len(*res) == 0 {
		return []surrealModels.RecordID{}, nil
	}
	careers := (*res)[0].Result
	if careers == nil {
		return []surrealModels.RecordID{}, nil
	}
	return careers, nil
}
