package course

import (
	"errors"
	"net/http"
	"strconv"

	"metrograma/middlewares"
	authMiddlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/interactions/course/DTO"
	"metrograma/modules/interactions/course/services"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	grp := e.Group("/course", authMiddlewares.StudentAuth)
	// Write operations have rate limiting (50 req/min per IP)
	grp.POST("/", createCourse, middlewares.WriteRateLimit())
	grp.GET("/:trimesterId", getCourseByTrimester)
}

// createCourse godoc
// @Summary Create a course (student-course relationship)
// @Description Creates a course record for the authenticated student
// @Tags course
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param course body DTO.CreateCourse true "Course payload"
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course/ [post]
func createCourse(c echo.Context) error {
	var input DTO.CreateCourse
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid body")
	}

	studentId := c.Get("student-id").(surrealModels.RecordID)

	data, err := services.CreateCourse(studentId, input)
	if err != nil {
		var httpErr *echo.HTTPError
		if errors.As(err, &httpErr) {
			return httpErr
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, map[string]any{"message": "Horario creado exitosamente", "data": data})
}

// getCourseByTrimester godoc
// @Summary Get course sections for a trimester
// @Description Returns the student's course sections for the given trimester. If is_principal=true (default) returns principal_sections with their schedules.
// @Tags course
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param trimesterId path string true "Trimester ID"
// @Param is_principal query bool false "If true (default) returns principal sections; otherwise (future) could return other section types"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course/{trimesterId} [get]
func getCourseByTrimester(c echo.Context) error {
	trimesterId := c.Param("trimesterId")
	if trimesterId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "trimesterId requerido")
	}

	rawStudentId := c.Get("student-id")
	if rawStudentId == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "No se encontró el estudiante en la sesión")
	}
	studentId, ok := rawStudentId.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "student-id inválido")
	}

	isPrincipal := true
	if v := c.QueryParam("is_principal"); v != "" {
		parsed, err := strconv.ParseBool(v)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "is_principal debe ser booleano")
		}
		isPrincipal = parsed
	}

	sections, err := services.GetSectionsWithSchedules(studentId, trimesterId, isPrincipal)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if len(sections) == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "No se encontraron datos para el trimestre")
	}

	return c.JSON(http.StatusOK, map[string]any{
		"trimesterId":  trimesterId,
		"is_principal": isPrincipal,
		"sections":     sections,
	})
}
