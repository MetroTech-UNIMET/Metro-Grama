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
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

var createQuery = ` 
BEGIN TRANSACTION; 
	LET $deleted = DELETE ONLY course 
        WHERE in = $studentId AND out = $trimesterId
        RETURN BEFORE;

	RETURN RELATE ONLY $studentId->course->$trimesterId SET 
        principal_sections = $data.principal_sections ?? $deleted.principal_sections,
        secondary_sections = $data.secondary_sections ?? $deleted.secondary_sections;

COMMIT TRANSACTION;
`

func CreateCourse(studentId surrealModels.RecordID, input DTO.CreateCourse) (models.CourseEntity, error) {
	data := map[string]any{}
	if input.IsPrincipal {
		data["principal_sections"] = input.Sections
	} else {
		data["secondary_sections"] = input.Sections
	}

	params := map[string]any{
		"studentId":   studentId,
		"trimesterId": input.TrimesterId,
		"data":        data,
	}

	res, err := surrealdb.Query[models.CourseEntity](context.Background(), db.SurrealDB, createQuery, params)
	errorMessage := tools.ExtractSurrealErrorMessage(err.Error())
	switch errorMessage {
	case "All the sections from principal_sections must belong to the same trimester of the schedule":
		return models.CourseEntity{}, echo.NewHTTPError(http.StatusBadRequest, "Todas las secciones del horario principal deben pertenecer al mismo trimestre ")
	case "All the sections from secondary_sections must belong to the same trimester of the schedule":
		return models.CourseEntity{}, echo.NewHTTPError(http.StatusBadRequest, "Todas las secciones del horario secundario deben pertenecer al mismo trimestre ")
	}

	if err != nil {
		return models.CourseEntity{}, err
	}
	course := (*res)[0].Result
	return course, nil
}

// VivaFlembe1+
