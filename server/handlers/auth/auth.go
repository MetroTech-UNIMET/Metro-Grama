package auth

import (
	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	e.Any("/auth/google/login", oauthGoogleLogin)
	e.Any("/auth/google/callback", oauthGoogleCallback)
	e.Any("/auth/google/logout", oauthGoogleLogout)
	e.POST("/auth/admin/login", adminLogin)
}
