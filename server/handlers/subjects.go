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

	subjects, err := storage.GetSubjectByCareer(c.Request().Context(), career)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, subjects)
}

func createSubject(c echo.Context) error {
	var subjectForm models.SubjectForm
	if err := c.Bind(&subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid trimester")
	}
	if len(subjectForm.Careers) != len(subjectForm.Trimesters) {
		return echo.NewHTTPError(http.StatusBadRequest, "The number of trimesters and carrers must be the same")
	}

	subjectForm.SubjectCode = tools.ToID("subject", subjectForm.SubjectCode)
	if err := storage.ExistSubject(subjectForm.SubjectCode); err == nil {
		return echo.NewHTTPError(http.StatusConflict, "Already exist")
	}

	// Sacar las materias que preceden
	for i := 0; i < len(subjectForm.PrecedesCodes); i++ {
		subjectForm.PrecedesCodes[i] = tools.ToID("subject", subjectForm.PrecedesCodes[i])
		err := storage.ExistSubject(subjectForm.PrecedesCodes[i])
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", subjectForm.PrecedesCodes[i]))
		}
	}

	err := storage.CreateSubject(subjectForm)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, tools.CreateMsg("Subject created"))
}
