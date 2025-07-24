package subjects

import (
	"fmt"
	"metrograma/models"
	"metrograma/modules/subjects/services"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
	authMiddlewares "metrograma/modules/auth/middlewares"

)

func Handlers(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	subjectsGroup.GET("/", getSubjects)
	subjectsGroup.GET("/graph/", getSubjectsGraph)
	subjectsGroup.POST("/", createSubject, authMiddlewares.AdminAuth)
}

func getSubjects(c echo.Context) error {
	careers := c.QueryParam("careers")
	subjects, err := services.GetSubjects(careers)
	return tools.GetResponse(c, subjects, err)
}

func getSubjectsGraph(c echo.Context) error {
	careers := c.QueryParam("careers")

	if careers == "none" {
		return c.JSON(http.StatusOK, models.Graph[models.SubjectNode]{
			Nodes: []models.Node[models.SubjectNode]{},
			Edges: []models.Edge{},
		})
	}

	subjects, err := services.GetSubjectsGraph(careers)
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

	codeId := surrealModels.NewRecordID("subject", subjectForm.Code)
	if err := tools.ExistRecord(codeId); err == nil {
		return echo.NewHTTPError(http.StatusConflict, "Already exist")
	}

	for _, c := range subjectForm.Careers {
		if err := tools.ExistRecord(
			*surrealModels.ParseRecordID(c.CareerID),
		); err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", c.CareerID))
		}
	}

	for _, p := range subjectForm.PrecedesID {
		err := tools.ExistRecord(*surrealModels.ParseRecordID(p))
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", p))
		}
	}

	if err := services.CreateSubject(subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.NoContent(http.StatusCreated)
} 