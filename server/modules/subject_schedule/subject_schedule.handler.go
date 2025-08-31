package subject_schedule

import (
	"metrograma/modules/subject_schedule/DTO"
	"metrograma/modules/subject_schedule/services"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	grp := e.Group("/subject_schedule")
	grp.POST("/", createSubjectSchedule)
}

// createSubjectSchedule godoc
// @Summary Create subject schedules
// @Description Persist an array of subject schedules
// @Tags subject_schedule
// @Accept json
// @Produce json
// @Param schedules body DTO.CreateSubjectSchedule true "Schedules"
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /subject_schedule/ [post]
func createSubjectSchedule(c echo.Context) error {
	var input DTO.CreateSubjectSchedule
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest,
			"Error al procesar la solicitud")
	}

	schedules, err := services.CreateSubjectSchedule(input)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, map[string]any{"message": "Horarios creados exitosamente", "schedules": schedules})
}
