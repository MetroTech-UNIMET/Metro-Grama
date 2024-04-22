package middlewares

import (
	"metrograma/env"

	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

func UserJWTAuth() echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: env.UserTokenSigninKey,
	})
}

func AdminJWTAuth() echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: env.AdminTokenSigninKey,
	})
}
