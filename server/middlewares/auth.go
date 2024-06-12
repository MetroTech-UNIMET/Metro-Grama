package middlewares

import (
	"fmt"
	"metrograma/storage"
	"net/http"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

func UserAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sessAuth, err := session.Get("auth", c)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}
		userID, ok := sessAuth.Values["user-id"]
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}
		fmt.Println(userID)
		userIDStr, ok := userID.(string)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		user, err := storage.ExistStudent(userIDStr)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}

func AdminAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sessAuth, err := session.Get("auth", c)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}
		userID, ok := sessAuth.Values["user-id"]
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}
		userIDStr, ok := userID.(string)
		if !ok {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		user, err := storage.ExistStudent(userIDStr)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		if user.Role != "role:admin" {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}
