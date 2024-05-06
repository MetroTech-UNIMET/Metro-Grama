package handlers

import (
	"fmt"
	"metrograma/middlewares"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func subjectsHandler(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	// subjectsGroup.GET("/:career", getSubjectsByCareer)
	subjectsGroup.GET("/", getSubjects, middlewares.UserSessionAuth)
	subjectsGroup.POST("/", createSubject, middlewares.AdminJWTAuth())
}

// func getSubjectsByCareer(c echo.Context) error {
// 	career := c.Param("career")

// 	subjects, err := storage.GetSubjectByCareer(career)

// 	return tools.GetResponse(c, subjects, err)
// }

func getSubjects(c echo.Context) error {
	filter := c.QueryParam("filter")

	field := ""
	value := ""

	if filter == "all" {
		field = ""
		value = "all"
	} else {
		found := false
		field, value, found = strings.Cut(filter, ":")

		if !found {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter format. Expected 'field:value'.")
		}

	}

	subjects, err := storage.GetSubjects(field, value)

	return tools.GetResponse(c, subjects, err)
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
	if err := tools.ExistRecord(subjectForm.Code); err == nil {
		return echo.NewHTTPError(http.StatusConflict, "Already exist")
	}

	for _, c := range subjectForm.Careers {
		err := tools.ExistRecord(c.CareerID)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", c.CareerID))
		}
	}

	// Sacar las materias que preceden
	for _, p := range subjectForm.PrecedesID {
		err := tools.ExistRecord(p)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", p))
		}
	}

	if err := storage.CreateSubject(subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.NoContent(http.StatusCreated)
}
