package subjects

import (
	"fmt"
	"metrograma/models"
	"metrograma/modules/subjects/services"
	"metrograma/tools"
	"net/http"

	authMiddlewares "metrograma/modules/auth/middlewares"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	subjectsGroup := e.Group("/subjects")
	subjectsGroup.GET("/", getSubjects)
	subjectsGroup.GET("/graph/", getSubjectsGraph)
	subjectsGroup.POST("/", createSubject, authMiddlewares.AdminAuth)
}

// getSubjects godoc
// @Summary      List subjects
// @Description  Get subjects, optionally filtered by careers query param
// @Tags         subjects
// @Accept       json
// @Produce      json
// @Param        careers  query     string  false  "careers filter"
// @Success      200  {array}   models.SubjectNode
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /subjects/ [get]
func getSubjects(c echo.Context) error {
	careers := c.QueryParam("careers")
	if careers == "" {
		careers = "none"
	}

	subjects, err := services.GetSubjects(careers)
	return tools.GetResponse(c, subjects, err)
}

// getSubjectsGraph godoc
// @Summary      Get subjects graph
// @Description  Returns a graph of subjects (nodes and edges) for given careers
// @Tags         subjects
// @Accept       json
// @Produce      json
// @Param        careers  query     string  false  "careers or 'none'"
// @Success      200  {object}  models.Graph[models.SubjectNode]
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /subjects/graph/ [get]
func getSubjectsGraph(c echo.Context) error {
	careers := c.QueryParam("careers")
	if careers == "" {
		careers = "none"
	}

	if careers == "none" {
		return c.JSON(http.StatusOK, models.Graph[models.SubjectNode]{
			Nodes: []models.Node[models.SubjectNode]{},
			Edges: []models.Edge{},
		})
	}

	subjects, err := services.GetSubjectsGraph(careers)
	return tools.GetResponse(c, subjects, err)
}

// createSubject godoc
// @Summary      Create a new subject
// @Description  Create a subject with careers and precedes
// @Tags         subjects
// @Accept       json
// @Produce      json
// @Param        subject  body      models.SubjectForm  true  "Subject form"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      409  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /subjects/ [post]
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
		careerID,err := surrealModels.ParseRecordID(c.CareerID)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Career `%s` not found", c.CareerID))
		}
		if err := tools.ExistRecord(*careerID); err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", c.CareerID))
		}
	}

	for _, p := range subjectForm.PrecedesID {
		precedesID, err := surrealModels.ParseRecordID(p)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", p))
		}
		if err := tools.ExistRecord(*precedesID); err != nil {
			return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Precedes subject `%s` not found", p))
		}
	}

	if err := services.CreateSubject(subjectForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.NoContent(http.StatusCreated)
}
