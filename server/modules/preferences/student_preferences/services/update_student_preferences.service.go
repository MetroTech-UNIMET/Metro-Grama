package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	DTO "metrograma/modules/preferences/student_preferences/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// UpdateStudentPreferences updates the preferences row(s) for the provided student
// Returns the updated rows. Assumes one row per student, but returns slice for safety.
func UpdateStudentPreferences(studentId surrealModels.RecordID, input DTO.UpdateStudentPreferencesDTO) (*models.StudentPreferencesEntity, error) {
	qb := surrealql.UpdateOnly("student_preferences").
		Where("student == ?", studentId).
		Set("show_friends", input.ShowFriends).
		Set("show_schedule", input.ShowSchedule).
		Set("show_subjects", input.ShowSubjects)

	sql, vars := qb.Build()

	res, err := surrealdb.Query[models.StudentPreferencesEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return nil, err
	}

	updated := (*res)[0].Result

	return &updated, nil
}
