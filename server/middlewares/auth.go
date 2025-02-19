package middlewares

import (
	"metrograma/models"
	"metrograma/storage"
	"net/http"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

func UserAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := getUserFromSession(c)
		if err != nil {
			return err
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}

func AdminAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := getUserFromSession(c)
		if err != nil {
			return err
		}

		if user.Role.ID != "admin" {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}

func getUserFromSession(c echo.Context) (*models.MinimalUser, error) {
	sessAuth, err := session.Get("auth", c)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}
	userID, ok := sessAuth.Values["user-id"]
	if !ok {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}
	userIDStr, ok := userID.(string)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}

	user, err := storage.ExistUser(userIDStr)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}

	return &user, nil
}
