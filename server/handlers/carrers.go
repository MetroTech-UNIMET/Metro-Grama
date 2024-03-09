package handlers

import (
	"fmt"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
)

func careersHandler(e *echo.Group) {
	careersGroup := e.Group("/careers")
	careersGroup.GET("/", getAllCareer)
	careersGroup.POST("/", createCarrer)
}

func getAllCareer(c echo.Context) error {
	careers, err := storage.GetAllCareer(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}

	return c.JSON(http.StatusOK, careers)
}

type CareerForm struct {
	CareerName string `form:"careerName"`
}

func createCarrer(c echo.Context) error {
	var careerForm CareerForm
	if err := c.Bind(&careerForm); err != nil {
		return c.JSON(http.StatusBadRequest, tools.CreateMsg("Invalid career name"))
	}
	fmt.Println(careerForm)

	_, err := storage.CreateCarrer(c.Request().Context(), careerForm.CareerName)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, tools.CreateMsg(err.Error()))
	}

	return c.JSON(http.StatusCreated, tools.CreateMsg("Subject created"))
}
