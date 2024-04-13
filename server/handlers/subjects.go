package handlers

import (
	"fmt"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
)

func subjectsHandler(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	subjectsGroup.GET("/:career", getSubjectsByCareer)
	subjectsGroup.POST("/", createSubject)
}

func getSubjectsByCareer(c echo.Context) error {
	career := c.Param("career")

	subjects, err := storage.GetSubjectByCareer(career)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, subjects)
}

func createSubject(c echo.Context) error {
	var subjectForm models.SubjectForm
	if err := c.Bind(&subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	subjectForm.Code = tools.ToID("subject", subjectForm.Code)
	if err := storage.ExistRecord(subjectForm.Code); err == nil {
		return echo.NewHTTPError(http.StatusConflict, "Already exist")
	}

	for _, c := range subjectForm.Carrers {
		err := storage.ExistRecord(c.CarrerID)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", c.CarrerID))
		}
	}

	// Sacar las materias que preceden
	for _, p := range subjectForm.PrecedesID {
		err := storage.ExistRecord(p)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", p))
		}
	}

	err := storage.CreateSubject(subjectForm)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, tools.CreateMsg("Subject created"))
}
