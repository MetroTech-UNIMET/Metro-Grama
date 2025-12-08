package careers

import (
	"fmt"
	"metrograma/middlewares"
	dto "metrograma/modules/careers/DTO"
	"metrograma/modules/careers/services"
	"metrograma/tools"
	"net/http"

	authMiddlewares "metrograma/modules/auth/middlewares"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	careersGroup := e.Group("/careers")
	careersGroup.GET("/", getCareers)
	// Write operations have rate limiting (50 req/min per IP)
	careersGroup.POST("/", createCareer, authMiddlewares.AdminAuth, middlewares.WriteRateLimit())
	careersGroup.DELETE("/:careerId", deleteCareer, authMiddlewares.AdminAuth, middlewares.WriteRateLimit())

	careersGroup.GET("/withSubjects/:careerId", getCareerWithSubjectsById)
	careersGroup.PATCH("/withSubjects/:careerId", updateCareerWithSubjects, authMiddlewares.AdminAuth, middlewares.WriteRateLimit())
}

// getCareers godoc
// @Summary      List careers
// @Description  Get all careers
// @Tags         careers
// @Accept       json
// @Produce      json
// @Success      200  {array}   models.CareerEntity
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /careers/ [get]
func getCareers(c echo.Context) error {
	careers, err := services.GetCareers()
	return tools.GetResponse(c, careers, err)
}

// createCareer godoc
// @Summary      Create career
// @Description  Create a new career
// @Tags         careers
// @Accept       json
// @Produce      json
// @Param        career  body      models.CareerCreateForm  true  "Career form"
// @Success      201  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      409  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /careers/ [post]
func createCareer(c echo.Context) error {
	var careerForm dto.CareerCreateForm
	if err := c.Bind(&careerForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(careerForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	careerID := surrealModels.NewRecordID("career", careerForm.Id)
	if err := tools.ExistRecord(careerID); err == nil {
		fmt.Println(careerID, err)
		return echo.NewHTTPError(http.StatusConflict, fmt.Errorf("career with id '%s' already exists", careerID))
	}

	if err := services.CreateCareer(careerForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "The career was created successfully",
	})
}

type deleteCareerParam struct {
	ID string `param:"careerId" validate:"required"`
}

// TODO - Testear
// deleteCareer godoc
// @Summary      Delete a career
// @Description  Deletes a career by id
// @Tags         careers
// @Accept       json
// @Produce      json
// @Param        careerId  path  string  true  "Career ID"
// @Success      204
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /careers/{careerId}/ [delete]
func deleteCareer(c echo.Context) error {
	var target deleteCareerParam
	if err := c.Bind(&target); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(target); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := services.DeleteCareer(target.ID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	return nil
}

type updateCareerWithSubjectsParam struct {
	OldCareer     dto.CareerWithSubjects `json:"oldCareer" validate:"required"`
	NewCareerForm dto.CareerUpdateForm   `json:"newCareer" validate:"required"`
}

func updateCareerWithSubjects(c echo.Context) error {
	var target updateCareerWithSubjectsParam
	if err := c.Bind(&target); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(target); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := services.UpdateCareer(target.OldCareer, target.NewCareerForm); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "La carrera fue actualizada exitosamente",
	})
}

// getCareerWithSubjectsById godoc
// @Summary      Get career with subjects
// @Description  Returns a career and its subjects by id
// @Tags         careers
// @Accept       json
// @Produce      json
// @Param        careerId  path  string  true  "Career ID"
// @Success      200  {object}  models.CareerWithSubjects
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /careers/withSubjects/{careerId}/ [get]
func getCareerWithSubjectsById(c echo.Context) error {
	careerId := c.Param("careerId")
	if careerId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "careerId is required")
	}

	career, err := services.GetCareerWithSubjectsById(careerId)
	return tools.GetResponse(c, career, err)
}
