package careers

import (
	"fmt"
	"metrograma/middlewares"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	careersGroup := e.Group("/careers")
	careersGroup.GET("/", getCareers)
	careersGroup.POST("/", createCareer, middlewares.AdminAuth)
	careersGroup.DELETE("/:careerId", deleteCareer, middlewares.AdminAuth)
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

	if len(careerForm.Name) >= 5 {
		careerForm.ID_Name = careerForm.Name[len(careerForm.Name)-5:]
	} else {
		return echo.NewHTTPError(http.StatusBadRequest, "career name must have at least 5 characters")
	}

	if err := c.Validate(careerForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	careerID := tools.ToID("career", careerForm.ID_Name)
	if err := tools.ExistRecord(careerID); err == nil {
		fmt.Println(careerID, err)
		return echo.NewHTTPError(http.StatusConflict, fmt.Errorf("career with id '%s' already exists", careerID))
	}

	if err := storage.CreateCareer(careerForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "The career was created successfully",
	})
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

	if err := storage.DeleteCareer(target.ID, target.Subjects); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}

// func getCareerById(c echo.Context) error {
// 	subjects, err := storage.GetCareerById(careerId)
// 	if err != nil {
// 		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
// 	}

// 	return c.JSON(http.StatusOK, subjects)
// }
