package handlers

import (
	"fmt"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
)

func usersHandler(e *echo.Group) {
	usersGroup := e.Group("/users")
	usersGroup.GET("/verifie/:token", login)
	usersGroup.GET("/login", login)
	usersGroup.POST("/sigin", signin)
}

func login(c echo.Context) error {
	var loginForm models.StudentLoginForm
	if err := c.Bind(&loginForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(loginForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	storage.LoginStudent(loginForm)

	return nil
}

func signin(c echo.Context) error {
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
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return nil
}
