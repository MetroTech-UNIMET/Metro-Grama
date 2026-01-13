package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetStudentPreferencesByStudent returns all StudentPreferencesEntity rows for a given student
func GetStudentPreferencesByStudent(studentId surrealModels.RecordID) (models.StudentPreferencesEntity, error) {
	qb := surrealql.SelectOnly("student_preferences").Where("student == ?", studentId)
	sql, vars := qb.Build()

	res, err := surrealdb.Query[models.StudentPreferencesEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.StudentPreferencesEntity{}, err
	}

	preference := (*res)[0].Result

	return preference, nil

}
