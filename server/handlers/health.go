package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func healthHandler(e *echo.Group) {
	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "😎")
	})
}
