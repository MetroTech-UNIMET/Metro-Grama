package student

import (
	authMiddlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/student/services"
	"net/http"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Handlers registers the student interaction endpoints
func Handlers(e *echo.Group) {
	grp := e.Group("/student", authMiddlewares.StudentAuth)
	grp.GET("/career", getStudentCareer)
}

// getStudentCareer godoc
// @Summary Get student careers
// @Description Returns the careers related to the authenticated student via the study relation
// @Tags student
// @Accept json
// @Produce json
// @Security CookieAuth
// @Success 200 {object} map[string]any
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /student/career [get]
func getStudentCareer(c echo.Context) error {
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Estudiante no autenticado")
	}

	studentId, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "ID de estudiante inválido")
	}

	careers, err := services.GetStudentCareers(studentId)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]any{
		"data":    careers,
		"message": "Carreras obtenidas exitosamente",
	})
}
