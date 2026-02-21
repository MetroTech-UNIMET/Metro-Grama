package services

import (
	"context"
	"errors"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func GetEnrollment(studentId surrealModels.RecordID, subjectId surrealModels.RecordID) (models.EnrollEntity, error) {

	qb := surrealql.SelectOnly("enroll").
		Where("in = ?", studentId).
		Where("out = ?", subjectId).
		Where("grade >= 10")

	query, params := qb.Build()

	resultSelect, err := surrealdb.Query[models.EnrollEntity](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	if len(*resultSelect) == 0 {
		return models.EnrollEntity{}, errors.New("enrollment not found")
	}

	enrollment := (*resultSelect)[0].Result

	return enrollment, nil
}
