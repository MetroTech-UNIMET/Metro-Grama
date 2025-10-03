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
	grp.GET("/details", getStudentDetails)
	grp.GET("/profile/:studentId", getStudentByID)
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

// getStudentDetails godoc
// @Summary Get complete student details
// @Description Returns the authenticated student's info, including careers, user data and passed subjects
// @Tags student
// @Accept json
// @Produce json
// @Security CookieAuth
// @Success 200 {object} map[string]any
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /student/details [get]
func getStudentDetails(c echo.Context) error {
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Estudiante no autenticado")
	}

	studentId, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "ID de estudiante inválido")
	}

	details, err := services.GetStudentDetails(studentId, nil)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]any{
		"data":    details,
		"message": "Detalles del estudiante obtenidos exitosamente",
	})
}

// getStudentByID godoc
// @Summary Get student details by ID
// @Description Returns the student's info, including careers, user data and passed subjects by student ID
// @Tags student
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param studentId path string true "Student ID"
// @Success 200 {object} map[string]any
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /student/profile/{studentId} [get]
func getStudentByID(c echo.Context) error {
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Estudiante no autenticado")
	}

	loggedStudentId, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "ID de estudiante inválido")
	}

	studentIdString := c.Param("studentId")
	if studentIdString == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "ID de estudiante requerido")
	}

	studentId := surrealModels.NewRecordID("student", studentIdString)

	details, err := services.GetStudentDetails(studentId, &loggedStudentId)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]any{
		"data":    details,
		"message": "Detalles del estudiante obtenidos exitosamente",
	})
}
