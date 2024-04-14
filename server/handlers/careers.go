package handlers

import (
	"metrograma/storage"
	"metrograma/tools"

	"github.com/labstack/echo/v4"
)

func careersHandler(e *echo.Group) {
	careersGroup := e.Group("/careers")
	careersGroup.GET("/", getCareers)
	// subjectsGroup.GET("/:careerId", getCareerById)
}

func getCareers(c echo.Context) error {
	careers, err := storage.GetCareers()

	return tools.GetResponse(c, careers, err)
}

// func getCareerById(c echo.Context) error {
// 	careerId := c.Param("careerId")

// 	subjects, err := storage.GetCareerById(careerId)
// 	if err != nil {
// 		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
// 	}

// 	return c.JSON(http.StatusOK, subjects)
// }
