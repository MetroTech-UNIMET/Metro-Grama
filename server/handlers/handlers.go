package handlers

import "github.com/labstack/echo/v4"

func CreateHandlers(e *echo.Echo) {
	apiGroup := e.Group("/api")
	healthHandler(apiGroup)
	subjectsHandler(apiGroup)
}
