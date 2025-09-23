package services

import (
	"context"
	"metrograma/db"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UnenrollStudent(studentId surrealModels.RecordID, subjects []string) error {
	query := surrealql.Delete("$studentId->enroll").Where("out in ?", tools.ToIdArray(subjects))

	sql, vars := query.Build()

	data, err := surrealdb.Query[any](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}
