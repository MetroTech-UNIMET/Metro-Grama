package handlers

import (
	"metrograma/handlers/auth"
	"metrograma/handlers/careers"
	"metrograma/handlers/health"
	"metrograma/handlers/interactions/enroll"
	"metrograma/handlers/students"
	"metrograma/handlers/subjects"

	"github.com/labstack/echo/v4"
)

func CreateHandlers(e *echo.Echo) {
	apiGroup := e.Group("/api")
	apiGroup.GET("*", func(c echo.Context) error {
		return echo.ErrNotFound
	})
	health.Handlers(apiGroup)
	subjects.Handlers(apiGroup)
	careers.Handlers(apiGroup)
	students.Handlers(apiGroup)
	auth.Handlers(apiGroup)
	enroll.Handlers(apiGroup)
}
