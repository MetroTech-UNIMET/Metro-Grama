package services

import (
	"context"
	"metrograma/db"

	surrealdb "github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

const getStudentCareersQuery = `SELECT VALUE ->study.out FROM ONLY $studentId;`

// GetStudentCareers returns the career record IDs linked to a student through the study relation
func GetStudentCareers(studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	params := map[string]any{
		"studentId": studentId,
	}

	res, err := surrealdb.Query[[]surrealModels.RecordID](context.Background(), db.SurrealDB, getStudentCareersQuery, params)
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
