package enroll

import (
	"fmt"
	"metrograma/middlewares"
	"metrograma/storage/interactions"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	passedGroup := e.Group("/enroll", middlewares.UserSessionAuth)

	passedGroup.POST("/", createPassed)
}

type RequestBody struct {
	Token string `json:"token"`
}

func createPassed(c echo.Context) error {
	userId := c.Get("user-id").(string)
	fmt.Println("User ID: ", userId)

	var body struct {
		Subjects []string `json:"subjects"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	subjects := body.Subjects
	if len(subjects) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "No subjects provided")
	}

	if err := interactions.EnrollStudent(userId, subjects); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	fmt.Println("Enrolled the subjects successfully")

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "You enrolled the subjects successfully",
	})
}
