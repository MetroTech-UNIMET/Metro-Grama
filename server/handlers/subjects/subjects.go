package subjects

import (
	"fmt"
	"metrograma/middlewares"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	// subjectsGroup.GET("/:career", getSubjectsByCareer)
	subjectsGroup.GET("/", getSubjects)
	subjectsGroup.POST("/", createSubject, middlewares.AdminJWTAuth())
}

// func getSubjectsByCareer(c echo.Context) error {
// 	career := c.Param("career")

// 	subjects, err := storage.GetSubjectByCareer(career)

// 	return tools.GetResponse(c, subjects, err)
// }

func getSubjects(c echo.Context) error {
	careers := c.QueryParam("careers")

	subjects, err := storage.GetSubjects(careers)

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
