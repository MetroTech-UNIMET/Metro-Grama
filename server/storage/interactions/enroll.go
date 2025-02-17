package interactions

import (
	"metrograma/db"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// FIXME - Quitar any
func EnrollStudent(studentId string, subjects []string) error {
	data, err := surrealdb.Query[any](db.SurrealDB, "RELATE $studentId -> enroll -> $subjectsId", map[string]interface{}{
		"studentId":  surrealModels.NewRecordID("student", studentId),
		"subjectsId": tools.ToIdArray(subjects),
	})

	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func UnenrollStudent(studentId string, subjects []string) error {
	data, err := surrealdb.Query[any](db.SurrealDB, "DELETE $studentId->enroll WHERE out in $subjectsId", map[string]any{
		"studentId":  surrealModels.NewRecordID("student", studentId),
		"subjectsId": tools.ToIdArray(subjects),
	})

	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func GetEnrolledSubjects(studentId string) ([]surrealModels.RecordID, error) {

	query, err := surrealdb.Query[[]surrealModels.RecordID](db.SurrealDB, "SELECT VALUE out from enroll WHERE in == $studentId and passed == true", map[string]any{
		"studentId": surrealModels.NewRecordID("student", studentId),
	})

	if err != nil {
		return []surrealModels.RecordID{}, err
	}

	subjects := (*query)[0].Result

	return subjects, nil
}
