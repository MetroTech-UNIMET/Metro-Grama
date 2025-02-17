package subjects

import (
	"fmt"
	"metrograma/middlewares"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// TODO - Testar (se puede omitir el middleware)
func Handlers(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	subjectsGroup.GET("/", getSubjects, middlewares.AdminAuth)
	subjectsGroup.GET("/graph/", getSubjectsGraph)
	subjectsGroup.POST("/", createSubject, middlewares.AdminAuth)
	// subjectsGroup.GET("/:career", getSubjectsByCareer)
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

func getSubjectsGraph(c echo.Context) error {
	careers := c.QueryParam("careers")

	if careers == "none" {
		return c.JSON(http.StatusOK, models.Graph[models.SubjectNode]{
			Nodes: []models.Node[models.SubjectNode]{},
			Edges: []models.Edge{},
		})
	}

	subjects, err := storage.GetSubjectsGraph(careers)
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

	// Sacar las materias que preceden
	for _, p := range subjectForm.PrecedesID {
		err := tools.ExistRecord(*surrealModels.ParseRecordID(p))
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", p))
		}
	}

	if err := storage.CreateSubject(subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.NoContent(http.StatusCreated)
}
