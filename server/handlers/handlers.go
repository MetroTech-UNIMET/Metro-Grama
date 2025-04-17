package handlers

import (
	"metrograma/handlers/health"
	"metrograma/modules/auth"
	"metrograma/modules/careers"
	"metrograma/modules/interactions"
	"metrograma/modules/subjects"
	"metrograma/modules/users"

	"github.com/labstack/echo/v4"
)

func CreateHandlers(e *echo.Echo) {
	apiGroup := e.Group("/api")
	apiGroup.Any("*", func(c echo.Context) error {
		return echo.ErrNotFound
	})
	health.Handlers(apiGroup)
	subjects.Handlers(apiGroup)
	careers.Handlers(apiGroup)
	users.Handlers(apiGroup)
	auth.Handlers(apiGroup)
	interactions.Handlers(apiGroup)
}
