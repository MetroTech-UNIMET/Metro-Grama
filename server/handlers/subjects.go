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
		return c.JSON(http.StatusBadRequest, tools.CreateMsg("Invalid trimester"))
	}

	// Ok, por alguna razon el sdk de surreal no me suelta el error de que ya existe
	if _, err := storage.GetSubject(tools.ToID("subjects", subjectForm.SubjectCode)); err == nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg("Already exist"))
	}

	subject := models.SubjectInput{
		ID:               subjectForm.SubjectCode,
		Name:             subjectForm.SubjectName,
		Trimester:        subjectForm.Trimester,
		Careers:          subjectForm.Careers,
		PrecedesSubjects: make([]string, len(subjectForm.PrecedesCodes)),
	}

	// Sacar las materias que preceden
	for i := 0; i < len(subjectForm.PrecedesCodes); i++ {
		precedesSubject, err := storage.GetSubject(tools.ToID("subjects", subjectForm.PrecedesCodes[i]))
		if err != nil {
			return c.JSON(http.StatusNotFound, tools.CreateMsg(fmt.Sprintf("Precedes subject `%s` not found", subjectForm.PrecedesCodes[i])))
		}
		subject.PrecedesSubjects[i] = precedesSubject.ID
	}

	err := storage.CreateSubject(c.Request().Context(), subject)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}

	return c.JSON(http.StatusCreated, tools.CreateMsg("Subject created"))
}
