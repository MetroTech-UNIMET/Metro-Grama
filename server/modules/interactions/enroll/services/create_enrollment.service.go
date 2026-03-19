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
func EnrollStudent(ctx context.Context, studentId surrealModels.RecordID, subjectId surrealModels.RecordID, input DTO.CreateEnrolled) (models.EnrollEntity, error) {
	passedSubjects, err := GetPassedSubjectsIds(ctx, studentId)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	enrollQb := surrealql.Insert("enroll").Relation().
		Fields("in", "out", "trimester", "grade", "difficulty", "workload").
		Values(studentId, subjectId, input.TrimesterId, input.Grade, input.Difficulty, input.Workload).
		OnDuplicateKeyUpdateSet("grade", input.Grade).
		OnDuplicateKeyUpdateSet("difficulty", input.Difficulty).
		OnDuplicateKeyUpdateSet("workload", input.Workload)

	// This works as an Upsert; if the enrollment already exists, it will update the enrollment with the new trimester, grade, difficulty and workload
	qb := surrealql.Begin().
		Let("isEnrollable", surrealql.Expr("fn::is_subject_enrollable(?, ?, ?.distinct())", subjectId, studentId, passedSubjects)).
		If("!$isEnrollable").
		Then(func(tb *surrealql.ThenBuilder) {
			tb.Throw("El estudiante no cumple con los requisitos para inscribirse en esta materia")
		}).End().
		Return("?", enrollQb)
	sql, vars := qb.Build()

	result, err := surrealdb.Query[[]models.EnrollEntity](ctx, db.SurrealDB, sql, vars)
	if err != nil {
		return models.EnrollEntity{}, err
	}
	// FIXME - Por algunar razon gracias a surrealDb 3.0.0 debo poner -2 en vez de obtener el penultimo
	enrollmentData, err := tools.SafeResult(result, -2)
	if err != nil || len(enrollmentData) == 0 {
		return models.EnrollEntity{}, echo.NewHTTPError(http.StatusInternalServerError, "No se pudo crear la inscripción")
	}

	return enrollmentData[0], nil
}
