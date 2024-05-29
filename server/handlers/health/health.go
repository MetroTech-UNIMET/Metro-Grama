package health

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	e.GET("/health", health)
}

func health(c echo.Context) error {
	return c.String(http.StatusOK, "😎")
}
