package stats

import (
	"fmt"
	"net/http"

	middlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/stats/services"
	"metrograma/tools"

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
// @Param        studentFilter query string false "Which students to include in the stats" Enums(all, friends, friendsFriends) default(all)
// @Param        careers query string false "Comma-separated list of career RecordIDs to filter by the subject's belonging careers"
// @Param        startingTrimester query string false "Lower bound trimester RecordID (e.g., 2425-1)"
// @Param        endingTrimester   query string false "Upper bound trimester RecordID (e.g., 2425-3)"
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /stats/subjects/{subjectId} [get]
func getSubjectStats(c echo.Context) error {
	subjectId := c.Param("subjectId")
	if subjectId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'subjectId' es requerido")
	}

	// Optional query param to filter by students scope
	studentFilter := c.QueryParam("studentFilter")
	if studentFilter == "" {
		studentFilter = "all"
	} else {
		switch studentFilter {
		case "all", "friends", "friendsFriends":
			// ok
		default:
			return echo.NewHTTPError(http.StatusBadRequest, "studentFilter inválido: debe ser 'all', 'friends', o 'friendsFriends'")
		}
	}

	// Always attempt to get student from session
	var studentId surrealModels.RecordID
	if student, err := middlewares.GetStudentFromSession(c); err != nil {
		// If filter is not 'all', authentication is required
		if studentFilter != "all" {
			return err
		}
	} else if student != nil {
		studentId = student.ID
	}

	// Convert to RecordID as in subject_offer handlers
	subjectRecord := surrealModels.NewRecordID("subject", subjectId)

	// Optional careers filter: comma-separated RecordIDs (e.g., "career:sistemas,career:quimica")
	careersParam := c.QueryParam("careers")
	fmt.Printf("Careers param: %s\n", careersParam)

	var careers []surrealModels.RecordID
	if careersParam == "" {
		careers = []surrealModels.RecordID{}
	} else {
		careers = tools.StringToIdArray(careersParam)
	}

	// Optional trimester bounds
	var startingTrimesterId *surrealModels.RecordID
	var endingTrimesterId *surrealModels.RecordID

	if v := c.QueryParam("startingTrimester"); v != "" {
		parsedRecord := surrealModels.NewRecordID("trimester", v)

		startingTrimesterId = &(parsedRecord)
	}

	if v := c.QueryParam("endingTrimester"); v != "" {
		parsedRecord := surrealModels.NewRecordID("trimester", v)

		endingTrimesterId = &parsedRecord
	}

	stats, err := services.QuerySubjectStats(subjectRecord, studentId, studentFilter, careers, startingTrimesterId, endingTrimesterId)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, stats)
}
