package services

import (
	"context"
	"metrograma/db"
	DTO "metrograma/modules/interactions/enroll/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func EnrollStudent(studentId surrealModels.RecordID, subjectId surrealModels.RecordID, input DTO.CreateEnrolled) error {
	qb := surrealql.Relate(studentId, "enroll", subjectId).
		Set("trimester", input.TrimesterId).
		Set("grade", input.Grade).
		Set("difficulty", input.Difficulty).
		Set("workload", input.Workload)

	sql, vars := qb.Build()

	data, err := surrealdb.Query[any](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}
