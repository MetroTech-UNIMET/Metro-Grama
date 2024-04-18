package handlers

import (
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
)

func careersHandler(e *echo.Group) {
	careersGroup := e.Group("/careers")
	careersGroup.GET("/", getCareers)
	careersGroup.POST("/", createCareer)
	// subjectsGroup.GET("/:careerId", getCareerById)
}

func getCareers(c echo.Context) error {
	careers, err := storage.GetCareers()

	return tools.GetResponse(c, careers, err)
}

func createCareer(c echo.Context) error {
	var careerForm models.CareerForm
	if err := c.Bind(&careerForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(careerForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := storage.ExistRecord(tools.ToID("career", careerForm.ID_Name)); err == nil {
		return echo.NewHTTPError(http.StatusConflict, "career already exist")
	}

	if err := storage.CreateCareer(careerForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return nil
}

// func getCareerById(c echo.Context) error {
// 	careerId := c.Param("careerId")

// 	subjects, err := storage.GetCareerById(careerId)
// 	if err != nil {
// 		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
// 	}

// 	return c.JSON(http.StatusOK, subjects)
// }
