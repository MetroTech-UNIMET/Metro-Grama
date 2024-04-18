package handlers

import (
	"fmt"
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
	careersGroup.DELETE("/:careerId", deleteCareer)
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

type deleteCareerParam struct {
	ID       string `param:"careerId" validate:"required"`
	Subjects bool   `query:"subjects"`
}

func deleteCareer(c echo.Context) error {
	var target deleteCareerParam
	if err := c.Bind(&target); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(target); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	fmt.Println(target)

	return storage.DeleteCareer(target.ID, target.Subjects)
}

// func getCareerById(c echo.Context) error {
// 	subjects, err := storage.GetCareerById(careerId)
// 	if err != nil {
// 		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
// 	}

// 	return c.JSON(http.StatusOK, subjects)
// }
