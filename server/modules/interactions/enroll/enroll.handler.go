package enroll

import (
	authMiddlewares "metrograma/modules/auth/middlewares"
	DTO "metrograma/modules/interactions/enroll/DTO"
	"metrograma/modules/interactions/enroll/services"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	enrollGroup := e.Group("/enroll", authMiddlewares.StudentAuth)

	// POST /enroll/:subject - subject is a code like BPTFI01
	enrollGroup.POST("/:subject", createPassed)
	enrollGroup.DELETE("/", deletePassed)
	enrollGroup.GET("/", getEnrolledSubjects)
}

func extractData(c echo.Context) (*models.RecordID, []string, error) {
	studentId := c.Get("student-id")
	if studentId == nil {
		return nil, nil, echo.NewHTTPError(http.StatusUnauthorized)
	}

	var body struct {
		Subjects []string `json:"subjects"`
	}
	if err := c.Bind(&body); err != nil {
		return nil, nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	subjects := body.Subjects
	if len(subjects) == 0 {
		return nil, nil, echo.NewHTTPError(http.StatusBadRequest, "No subjects provided")
	}

	userID, ok := studentId.(models.RecordID)
	if !ok {
		return nil, nil, echo.NewHTTPError(http.StatusUnauthorized, "Invalid user ID")
	}

	return &userID, subjects, nil
}

// createPassed godoc
// @Summary      Enroll subjects for user
// @Description  Enrolls the authenticated user into the provided subjects
// @Tags         enroll
// @Accept       json
// @Produce      json
// @Security     CookieAuth
// @Param        subject  path  string            true  "Subject code (e.g., BPTFI01)"
// @Param        body     body  DTO.CreateEnrolled  true  "Enrollment payload"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /enroll/ [post]
func createPassed(c echo.Context) error {
	// Get studentId from middleware
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	studentId, ok := raw.(models.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user ID")
	}

	// Bind DTO
	var input DTO.CreateEnrolled
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	subjectCode := c.Param("subject")
	if subjectCode == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing subject code in path")
	}
	subjectId := models.NewRecordID("subject", subjectCode)

	// Call service
	enrollment, err := services.EnrollStudent(studentId, subjectId, input)
	if err != nil {
		if strings.HasPrefix(err.Error(), "Database index `unique_relationships_by_trimester` already contains") {
			return echo.NewHTTPError(http.StatusConflict, "Ya marcaste esta materia en este trimestre")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusCreated, map[string]any{
		"message": "Marcaste la materia correctamente!",
		"data":    enrollment,
	})
}

// deletePassed godoc
// @Summary      Unenroll subjects for user
// @Description  Removes the authenticated user's enrollment for provided subjects
// @Tags         enroll
// @Accept       json
// @Produce      json
// @Security     CookieAuth
// @Param        body  body  object  true  "{\"subjects\": [string]}"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /enroll/ [delete]
func deletePassed(c echo.Context) error {
	userId, subjects, err := extractData(c)
	if err != nil {
		return err
	}

	if err := services.UnenrollStudent(*userId, subjects); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "You unenrolled the subjects successfully",
	})
}

// getEnrolledSubjects godoc
// @Summary      Get enrolled subjects for user
// @Description  Returns subjects the authenticated user is enrolled in
// @Tags         enroll
// @Accept       json
// @Produce      json
// @Security     CookieAuth
// @Param        onlyPassed  query  bool  false  "Only return passed subjects (grade >= 10)"
// @Success      200  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /enroll/ [get]
func getEnrolledSubjects(c echo.Context) error {
	studentId := c.Get("student-id").(models.RecordID)
	// Optional: onlyPassed query param (defaults to false)
	onlyPassedStr := c.QueryParam("onlyPassed")
	opts := services.GetEnrolledSubjectsOptions{}
	if onlyPassedStr != "" {
		v, err := strconv.ParseBool(onlyPassedStr)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid onlyPassed parameter")
		}
		opts.OnlyPassed = v
	}

	subjects, err := services.GetEnrolledSubjects(studentId, opts)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message": "Materias marcadas obtenidas correctamente",
		"data":    subjects,
	})
}
