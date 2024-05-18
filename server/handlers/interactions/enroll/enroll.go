package enroll

import (
	"fmt"
	"metrograma/middlewares"
	"metrograma/storage/interactions"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	enrollGroup := e.Group("/enroll", middlewares.UserAuth)

	enrollGroup.POST("/", createPassed)
	enrollGroup.DELETE("/", deletePassed)
	enrollGroup.GET("/", getEnrolledSubjects)
}

func extractData(c echo.Context) (string, []string, error) {
	userId := c.Get("user-id").(string)

	var body struct {
		Subjects []string `json:"subjects"`
	}
	if err := c.Bind(&body); err != nil {
		return "", nil, echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	subjects := body.Subjects
	if len(subjects) == 0 {
		return "", nil, echo.NewHTTPError(http.StatusBadRequest, "No subjects provided")
	}

	return userId, subjects, nil
}

func createPassed(c echo.Context) error {
	userId, subjects, err := extractData(c)
	if err != nil {
		return err
	}

	if err := interactions.EnrollStudent(userId, subjects); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	fmt.Println("Enrolled the subjects successfully")

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "You enrolled the subjects successfully",
	})
}

func deletePassed(c echo.Context) error {
	userId, subjects, err := extractData(c)
	if err != nil {
		return err
	}

	if err := interactions.UnenrollStudent(userId, subjects); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	fmt.Println("Unenrolled the subjects successfully")

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "You unenrolled the subjects successfully",
	})
}

func getEnrolledSubjects(c echo.Context) error {
	userId := c.Get("user-id").(string)

	subjects, err := interactions.GetEnrolledSubjects(userId)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"subjects": subjects,
	})
}
