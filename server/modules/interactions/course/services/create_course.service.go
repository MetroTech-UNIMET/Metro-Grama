package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/interactions/course/DTO"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func CreateCourse(ctx context.Context, studentId surrealModels.RecordID, input DTO.CreateCourse) (models.CourseEntity, error) {

	delete_Qb := surrealql.Delete("course").
		Where("in = $studentId").
		Where("out = $trimesterId").
		ReturnBefore()

	relate_Qb := surrealql.RelateOnly("$studentId", "course", "$trimesterId")

	if input.IsPrincipal {
		relate_Qb = relate_Qb.Set("principal_sections = ? ?? $deleted.principal_sections", input.Sections).
			Set("secondary_sections = $deleted.secondary_sections ?? []")
	} else {
		relate_Qb = relate_Qb.Set("secondary_sections = ? ?? $deleted.secondary_sections", input.Sections).
			Set("principal_sections = $deleted.principal_sections ?? []")
	}

	qb := surrealql.Begin().
		Let("deleted", surrealql.Expr("?[0]", delete_Qb)).
		Return("?", relate_Qb)

	sql, params := qb.Build()

	params["studentId"] = studentId
	params["trimesterId"] = input.TrimesterId

	res, err := surrealdb.Query[models.CourseEntity](ctx, db.SurrealDB, sql, params)
	if err != nil {
		errorMessage := tools.ExtractSurrealErrorMessage(err.Error())
		switch errorMessage {
		case "All the sections from principal_sections must belong to the same trimester of the schedule":
			return models.CourseEntity{}, echo.NewHTTPError(http.StatusBadRequest, "Todas las secciones del horario principal deben pertenecer al mismo trimestre ")
		case "All the sections from secondary_sections must belong to the same trimester of the schedule":
			return models.CourseEntity{}, echo.NewHTTPError(http.StatusBadRequest, "Todas las secciones del horario secundario deben pertenecer al mismo trimestre ")
		}
	}

	if err != nil {
		return models.CourseEntity{}, err
	}
	course, err := tools.SafeResult(res, 0)
	if err != nil {
		return models.CourseEntity{}, err
	}
	return course, nil
}
