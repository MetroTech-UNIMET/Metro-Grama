package handlers

import (
	"metrograma/handlers/health"
	"metrograma/modules/auth"
	"metrograma/modules/careers"
	"metrograma/modules/interactions"
	"metrograma/modules/notifications"
	"metrograma/modules/preferences"
	"metrograma/modules/stats"
	"metrograma/modules/student"
	"metrograma/modules/subject_offer"
	"metrograma/modules/subject_schedule"
	"metrograma/modules/subjects"
	"metrograma/modules/trimesters"
	"metrograma/modules/users"

	"github.com/labstack/echo/v4"
)

func CreateHandlers(e *echo.Echo) {
	apiGroup := e.Group("/api")
	health.Handlers(apiGroup)
	subjects.Handlers(apiGroup)
	careers.Handlers(apiGroup)
	users.Handlers(apiGroup)
	auth.Handlers(apiGroup)
	interactions.Handlers(apiGroup)
	notifications.Handlers(apiGroup)
	preferences.Handlers(apiGroup)
	trimesters.Handlers(apiGroup)
	student.Handlers(apiGroup)
	stats.Handlers(apiGroup)
	subject_offer.Handlers(apiGroup)
	subject_schedule.Handlers(apiGroup)

	apiGroup.Any("*", func(c echo.Context) error {
		return echo.ErrNotFound
	})
}
