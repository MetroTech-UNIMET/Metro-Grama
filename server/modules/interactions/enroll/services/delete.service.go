package services

import (
	"metrograma/db"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UnenrollStudent(studentId surrealModels.RecordID, subjects []string) error {
	data, err := surrealdb.Query[any](db.SurrealDB, "DELETE $studentId->enroll WHERE out in $subjectsId", map[string]any{
		"studentId":  studentId,
		"subjectsId": tools.ToIdArray(subjects),
	})

	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
} 