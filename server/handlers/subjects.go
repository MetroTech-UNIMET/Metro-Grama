package handlers

import (
	"fmt"
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
	println(fmt.Sprintf("Career: %s", career))

	subjects, err := storage.GetSubjectByCareer(c.Request().Context(), career)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	println(fmt.Sprintf("Subjects: %v", subjects))

	return c.JSON(http.StatusOK, subjects)
}

type SubjectForm struct {
	SubjectName  string `form:"subjectName"`
	SubjectCode  string `form:"subjectCode"`
	CareerName   string `form:"careerName"`
	Trimester    uint   `form:"trimester"`
	PrecedesCode string `form:"precedesCode"`
}

func createSubject(c echo.Context) error {
	var subjectForm SubjectForm
	if err := c.Bind(&subjectForm); err != nil {
		return c.JSON(http.StatusBadRequest, tools.CreateMsg("Invalid trimester"))
	}
	err := storage.CreateSubject(c.Request().Context(), subjectForm.SubjectName, subjectForm.SubjectCode, subjectForm.CareerName, subjectForm.Trimester, subjectForm.PrecedesCode)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}

	return c.JSON(http.StatusCreated, tools.CreateMsg("Subject created"))
}
