package interactions

import (
	"metrograma/db"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// FIXME - Quitar any
func EnrollStudent(studentId surrealModels.RecordID, subjects []string) error {
	data, err := surrealdb.Query[any](db.SurrealDB, "RELATE $studentId -> enroll -> $subjectsId", map[string]interface{}{
		"studentId":  studentId,
		"subjectsId": tools.ToIdArray(subjects),
	})

	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

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

func GetEnrolledSubjects(studentId surrealModels.RecordID) ([]string, error) {
	query, err := surrealdb.Query[[]string](db.SurrealDB, "SELECT VALUE <string> out from enroll WHERE in == $studentId and passed == true", map[string]any{
		"studentId": studentId,
	})

	if err != nil {
		return []string{}, err
	}

	subjects := (*query)[0].Result

	return subjects, nil
}
