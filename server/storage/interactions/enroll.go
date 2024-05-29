package interactions

import (
	"metrograma/db"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
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

func UnenrollStudent(studentId string, subjects []string) error {
	data, err := db.SurrealDB.Query("DELETE $studentId->enroll WHERE out in $subjectsId", map[string]interface{}{
		"studentId":  studentId,
		"subjectsId": subjects,
	})

	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func GetEnrolledSubjects(studentId string) ([]string, error) {
	rows, err := db.SurrealDB.Query("SELECT out from enroll WHERE in == $studentId and passed == true", map[string]interface{}{
		"studentId": studentId,
	})

	if err != nil {
		return nil, err
	}
	type Subject struct {
		Out string `json:"out"`
	}

	subjects, err := surrealdb.SmartUnmarshal[[]Subject](rows, err)

	if err != nil {
		return []string{}, err
	}

	subjectList := make([]string, len(subjects))
	for i, subject := range subjects {
		subjectList[i] = subject.Out
	}

	return subjectList, nil
}
