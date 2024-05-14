package interactions

import (
	"metrograma/db"
	"metrograma/tools"
)

func EnrollStudent(studentId string, subjects []string) error {
	data, err := db.SurrealDB.Query("RELATE $studentId -> enroll -> $subjectsId", map[string]interface{}{
		"studentId":  studentId,
		"subjectsId": subjects,
	})

	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}
