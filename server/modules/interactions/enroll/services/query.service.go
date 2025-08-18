package services

import (
	"context"
	"metrograma/db"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func GetEnrolledSubjects(studentId surrealModels.RecordID) ([]string, error) {
	query, err := surrealdb.Query[[]string](context.Background(), db.SurrealDB, "SELECT VALUE <string> out from enroll WHERE in == $studentId and passed == true", map[string]any{
		"studentId": studentId,
	})

	if err != nil {
		return []string{}, err
	}

	subjects := (*query)[0].Result

	return subjects, nil
} 