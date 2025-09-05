package course

import (
	"errors"
	"net/http"

	authMiddlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/interactions/course/DTO"
	"metrograma/modules/interactions/course/services"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	grp := e.Group("/course", authMiddlewares.StudentAuth)
	grp.POST("/", createCourse)
}

// createCourse godoc
// @Summary Create a course (student-course relationship)
// @Description Creates a course record for the authenticated student
// @Tags course
// @Accept json
// @Produce json
// @Param course body DTO.CreateCourse true "Course payload"
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course/ [post]
func createCourse(c echo.Context) error {
	var input DTO.CreateCourse
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
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
