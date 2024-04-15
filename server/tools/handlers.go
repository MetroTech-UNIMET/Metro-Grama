package tools

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func GetResponse[T any](c echo.Context, data T, err error) error {
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, data)
}
