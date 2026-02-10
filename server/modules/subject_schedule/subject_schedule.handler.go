package subject_schedule

import (
	"metrograma/middlewares"
	authMiddlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/subject_schedule/DTO"
	"metrograma/modules/subject_schedule/services"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	grp := e.Group("/subject_schedule", authMiddlewares.StudentAuth)
	// Write operations have rate limiting (50 req/min per IP)
	grp.POST("/", createSubjectSchedule, middlewares.WriteRateLimit())
}

// createSubjectSchedule godoc
// @Summary Create subject schedules
// @Description Persist an array of subject schedules
// @Tags subject_schedule
// @Accept json
// @Produce json
// @Param schedules body DTO.CreateSubjectSchedule true "Schedules"
// @Security     CookieAuth
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /subject_schedule/ [post]
func createSubjectSchedule(c echo.Context) error {
	// Extract authenticated user id from middleware
	raw := c.Get("user-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	userId, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "ID de usuario inválido")
	}

	// Bind input DTO
	var input DTO.CreateSubjectSchedule
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error al procesar la solicitud")
	}

	// Local overlapping validation
	if overlapErrs := input.ValidateNoOverlaps(); len(overlapErrs) > 0 {
		return echo.NewHTTPError(http.StatusBadRequest, strings.Join(overlapErrs, "; "))
	}

	// Call service with userId
	schedules, err := services.CreateSubjectSchedule(input, userId)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, map[string]any{"message": "Horarios creados exitosamente", "schedules": schedules})
}
