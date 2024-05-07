package auth

import (
	"metrograma/env"
	"metrograma/models"
	"metrograma/storage"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
)

func adminLogin(c echo.Context) error {
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
		"user-id": user.ID,
		"exp":     time.Now().Add(time.Hour * time.Duration(24) * time.Duration(30)).Unix(),
	})

	tokenStr, err := token.SignedString([]byte(env.AdminTokenSigninKey))

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"token": tokenStr,
	})
}
