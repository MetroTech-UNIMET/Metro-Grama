package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	DTO "metrograma/modules/interactions/enroll/DTO"
	"metrograma/tools"
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

	// TODO - Por la porqueria de 3.x.x por ahora $enrolled tiene que ser un array
	qb_Is_Subject_Enrollable := surrealql.Select(surrealql.Expr("fn::is_subject_enrollable(?, ?, ?.distinct())", subjectId, studentId, passedSubjects))

	sql, vars := qb_Is_Subject_Enrollable.Build()

	result_Is_Subject_Enrollable, err := surrealdb.Query[[]bool](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	isEnrollableResult, err := tools.SafeResult(result_Is_Subject_Enrollable, 0)
	if err != nil || len(isEnrollableResult) == 0 {
		return models.EnrollEntity{}, echo.NewHTTPError(http.StatusForbidden, "El estudiante no cumple con los requisitos para inscribirse en esta materia")
	}
	isEnrollable := isEnrollableResult[0]
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
	enrollmentData, err := tools.SafeResult(result, 0)
	if err != nil || len(enrollmentData) == 0 {
		return models.EnrollEntity{}, echo.NewHTTPError(http.StatusInternalServerError, "No se pudo crear la inscripción")
	}

	return enrollmentData[0], nil
}
