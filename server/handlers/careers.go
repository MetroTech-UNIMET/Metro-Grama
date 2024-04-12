package handlers

import (
	"fmt"
	"metrograma/storage"
	"net/http"

	"github.com/labstack/echo/v4"
)

func careersHandler(e *echo.Group) {
	careersGroup := e.Group("/careers")
	careersGroup.GET("/", getCareers)
}

func getCareers(c echo.Context) error {
	careers, err := storage.GetCareers()
	if err != nil {
		fmt.Println(err)
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, careers)
}