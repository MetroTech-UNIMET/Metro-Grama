package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	DTO "metrograma/modules/interactions/enroll/DTO"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// FIXME - Hacerlo en una sola trasacción
func EnrollStudent(studentId surrealModels.RecordID, subjectId surrealModels.RecordID, input DTO.CreateEnrolled) (models.EnrollEntity, error) {
	passedSubjects, err := GetPassedSubjectsIds(studentId)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	qb_Is_Subject_Enrollable := surrealql.Select(surrealql.Expr("fn::is_subject_enrollable(?, ?, ?)", subjectId, studentId, passedSubjects))

	sql, vars := qb_Is_Subject_Enrollable.Build()

	result_Is_Subject_Enrollable, err := surrealdb.Query[[]bool](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	isEnrollable := (*result_Is_Subject_Enrollable)[0].Result[0]
	if !isEnrollable {
		return models.EnrollEntity{}, echo.NewHTTPError(http.StatusForbidden, "El estudiante no cumple con los requisitos para inscribirse en esta materia")
	}

	// This works an Upsert; if the enrollment already exists, it will update the enrollment with the new trimester, grade, difficulty and workload
	qb := surrealql.Insert("enroll").Relation().
		Fields("in", "out", "trimester", "grade", "difficulty", "workload").
		Values(studentId, subjectId, input.TrimesterId, input.Grade, input.Difficulty, input.Workload).
		OnDuplicateKeyUpdateSet("grade", input.Grade).
		OnDuplicateKeyUpdateSet("difficulty", input.Difficulty).
		OnDuplicateKeyUpdateSet("workload", input.Workload)
	sql, vars = qb.Build()

	result, err := surrealdb.Query[[]models.EnrollEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.EnrollEntity{}, err
	}
	enrollmentData := (*result)[0].Result

	return enrollmentData[0], nil
}
