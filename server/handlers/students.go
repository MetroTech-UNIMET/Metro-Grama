package handlers

import (
	"fmt"
	"metrograma/env"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func usersHandler(e *echo.Group) {
	usersGroup := e.Group("/students")
	usersGroup.POST("/login", login)
	usersGroup.POST("/sigin", signin)
	usersGroup.GET("/verifie/:token", verifieEmail)
}

func login(c echo.Context) error {
	var loginForm models.StudentLoginForm
	if err := c.Bind(&loginForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(loginForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := storage.LoginStudent(loginForm)

	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * time.Duration(24) * time.Duration(30)).Unix(),
	})

	tokenStr := ""
	err = nil
	switch user.Role {
	case "role:user":
		tokenStr, err = token.SignedString([]byte(env.UserTokenSigninKey))
	case "role:admin":
		tokenStr, err = token.SignedString([]byte(env.AdminTokenSigninKey))
	}

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"token": tokenStr,
	})
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
		return echo.NewHTTPError(http.StatusConflict, err)
	}

	return c.NoContent(http.StatusCreated)
}

func verifieEmail(c echo.Context) error {
	return c.NoContent(http.StatusNotImplemented)
}
