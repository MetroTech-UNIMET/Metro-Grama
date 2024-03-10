package handlers

import (
	"fmt"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
)

type SubjectForm struct {
	SubjectName  string `form:"subjectName"`
	SubjectCode  string `form:"subjectCode"`
	CareerName   string `form:"careerName"`
	Trimester    uint   `form:"trimester"`
	PrecedesCode string `form:"precedesCode"`
}

type SubjectFormV2 struct {
	SubjectName         string  `form:"subjectName"`
	SubjectCode         string  `form:"subjectCode"`
	CareerName          string  `form:"careerName"`
	Trimester           uint    `form:"trimester"`
	PrecedesSubjectCode *string `form:"precedesSubjectCode"`
}

func subjectsHandler(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	subjectsGroup.GET("/:career", getSubjectsByCareer)
	subjectsGroup.GET("/v2/:career", getSubjectsByCareerV2)
	subjectsGroup.POST("/", createSubject)
	subjectsGroup.POST("/v2", createSubjectV2)
}

func getSubjectsByCareer(c echo.Context) error {
	career := c.Param("career")
	println(fmt.Sprintf("Career: %s", career))

	subjects, err := storage.GetSubjectByCareer(c.Request().Context(), career)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}
	println(fmt.Sprintf("Subjects: %v", subjects))

	return c.JSON(http.StatusOK, subjects)
}

func getSubjectsByCareerV2(c echo.Context) error {
	career := c.Param("career")
	println(fmt.Sprintf("Career: %s", career))

	subjects, err := storage.GetSubjectByCareerV2(c.Request().Context(), career)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}

	return c.JSON(http.StatusOK, subjects)
}

func createSubject(c echo.Context) error {
	var subjectForm SubjectForm
	if err := c.Bind(&subjectForm); err != nil {
		return c.JSON(http.StatusBadRequest, tools.CreateMsg("Invalid trimester"))
	}

	fmt.Println(subjectForm)

	_, err := storage.CreateSubject(c.Request().Context(), subjectForm.SubjectName, subjectForm.SubjectCode, subjectForm.CareerName, subjectForm.Trimester, subjectForm.PrecedesCode)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}

	return c.JSON(http.StatusCreated, tools.CreateMsg("Subject created"))
}

func createSubjectV2(c echo.Context) error {
	var subjectForm SubjectFormV2
	if err := c.Bind(&subjectForm); err != nil {
		return c.JSON(http.StatusBadRequest, tools.CreateMsg(err.Error()))
	}

	fmt.Println(subjectForm)

	_, err := storage.CreateSubjectv2(c.Request().Context(), subjectForm.SubjectName, subjectForm.SubjectCode, subjectForm.CareerName, subjectForm.Trimester, subjectForm.PrecedesSubjectCode)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}

	return c.JSON(http.StatusCreated, tools.CreateMsg("Subject created"))
}
