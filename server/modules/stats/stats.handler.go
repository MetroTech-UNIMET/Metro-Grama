package stats

import (
	"net/http"

	"metrograma/modules/stats/services"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Handlers registers stats routes
func Handlers(e *echo.Group) {
	g := e.Group("/stats")
	g.GET("/subjects/:subjectId", getSubjectStats)
}

// @Summary      Get subject stats
// @Description  Returns aggregated stats per trimester for the given subject (count, avg difficulty, avg grade, avg workload).
// @Tags         stats
// @Accept       json
// @Produce      json
// @Param        subjectId   path  string  true  "Subject ID (subject code)"
// @Success      200 {array} DTO.SubjectStat
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /stats/subjects/{subjectId} [get]
func getSubjectStats(c echo.Context) error {
	subjectId := c.Param("subjectId")
	if subjectId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "subjectId is required")
	}

	// Convert to RecordID as in subject_offer handlers
	subjectRecord := surrealModels.NewRecordID("subject", subjectId)

	stats, err := services.QuerySubjectStats(subjectRecord)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, stats)
}
