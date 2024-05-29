package students

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
	usersGroup := e.Group("/students")
	usersGroup.GET("/profile", studentProfile, middlewares.UserAuth)
	usersGroup.POST("/create_user", createStudent, middlewares.AdminAuth)
}

func createStudent(c echo.Context) error {
	var signinForm models.StudentSigninForm
	if err := c.Bind(&signinForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(signinForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := tools.ExistRecord(signinForm.CareerID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("career %s doesn't exist", signinForm.CareerID))
	}

	for _, s := range signinForm.SubjectsPassed {
		if err := tools.ExistRecord(s.ID); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("subject %s doesn't exist", s.ID))
		}
	}

	if err := storage.CreateStudent(signinForm); err != nil {
		return echo.NewHTTPError(http.StatusConflict, err)
	}

	return c.NoContent(http.StatusCreated)
}

func studentProfile(c echo.Context) error {
	userID := c.Get("user-id").(string)
	student, err := storage.GetStudent(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound)
	}

	return c.JSON(http.StatusOK, student)
}
