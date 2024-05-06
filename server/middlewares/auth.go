package middlewares

import (
	"metrograma/env"
	"net/http"

	"github.com/labstack/echo-contrib/session"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

func UserSessionAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sessAuth, err := session.Get("auth", c)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}
		if v, ok := sessAuth.Values["user-id"]; !ok {
			return echo.NewHTTPError(http.StatusUnauthorized)
		} else {
			c.Set("user-id", v)
		}
		return next(c)
	}
}

func AdminJWTAuth() echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: env.AdminTokenSigninKey,
	})
}