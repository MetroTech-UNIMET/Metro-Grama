package student_preferences

import (
	"net/http"

	"metrograma/middlewares"
	authMiddlewares "metrograma/modules/auth/middlewares"
	DTO "metrograma/modules/preferences/student_preferences/DTO"
	"metrograma/modules/preferences/student_preferences/services"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Handlers registers student preferences routes under /student_preferences
func Handlers(e *echo.Group) {
	grp := e.Group("/student_preferences", authMiddlewares.StudentAuth)
	grp.GET("/", getStudentPreferences)
	// Write operations have rate limiting (50 req/min per IP)
	grp.PUT("/", updateStudentPreferences, middlewares.WriteRateLimit())
}

// getStudentPreferences godoc
// @Summary Get current student's preferences
// @Description Returns the authenticated student's preferences
// @Tags preferences
// @Accept json
// @Produce json
// @Security CookieAuth
// @Success 200 {object} map[string]any
// @Failure 401 {object} map[string]string
// @Router /student_preferences/ [get]
func getStudentPreferences(c echo.Context) error {
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	studentId, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user ID")
	}

	prefs, err := services.GetStudentPreferencesByStudent(studentId)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message": "Preferencias del estudiante obtenidas exitosamente",
		"data":    prefs,
	})
}

// updateStudentPreferences godoc
// @Summary Update current student's preferences
// @Description Updates the authenticated student's preferences
// @Tags preferences
// @Accept json
// @Produce json
// @Security CookieAuth
// @Success 501 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /student_preferences/ [put]
func updateStudentPreferences(c echo.Context) error {
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	studentId, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user ID")
	}

	var input DTO.UpdateStudentPreferencesDTO
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	updated, err := services.UpdateStudentPreferences(studentId, input)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message": "Student preferences updated successfully",
		"data":    updated,
	})
}
