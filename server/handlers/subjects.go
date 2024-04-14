package handlers

import (
	"fmt"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func subjectsHandler(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	subjectsGroup.GET("/:career", getSubjectsByCareer)
	subjectsGroup.POST("/", createSubject)
	subjectsGroup.POST("/", getSubjects)

}

func getSubjectsByCareer(c echo.Context) error {
	career := c.Param("career")

	subjects, err := storage.GetSubjectByCareer(career)

	return tools.GetResponse(c, subjects, err)
}

func getSubjects(c echo.Context) error {
	filter := c.QueryParam("filter")
	parts := strings.Split(filter, ":")

	if len(parts) != 2 {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter format. Expected 'field:value'.")
	}

	field := parts[0]
	value := parts[1]

	subjects, err := storage.GetSubjects(field, value)

	return tools.GetResponse(c, subjects, err)
}

func createSubject(c echo.Context) error {
	var subjectForm models.SubjectForm
	if err := c.Bind(&subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
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

	return tools.GetResponse(c, tools.CreateMsg("Subject created"), err)
}
