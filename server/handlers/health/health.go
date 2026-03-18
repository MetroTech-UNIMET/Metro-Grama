package health

import (
	"metrograma/db"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	e.GET("/health", health)
}

// health godoc
// @Summary      Health check
// @Description  Returns the health status of the API
// @Tags         health
// @Accept       json
// @Produce      json
// @Success      200  {string}  string
// @Router       /health [get]
func health(c echo.Context) error {
	if err := db.HealthCheck(c.Request().Context()); err != nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{
			"status": "unhealthy",
			"db":     err.Error(),
		})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "healthy 😎"})
}
