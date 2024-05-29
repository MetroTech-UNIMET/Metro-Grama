package middlewares

import (
	"net/http"
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		// Optionally, you could return the error to give each route more control over the status code
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

func NewValidator() *CustomValidator {
	validate := validator.New()
	regex := regexp.MustCompile(`[\w-\.]+@correo.unimet.edu.ve`)
	err := validate.RegisterValidation("unimet_email", func(fl validator.FieldLevel) bool {
		value := fl.Field().String()
		return regex.MatchString(value)
	})
	if err != nil {
		panic(err)
	}
	return &CustomValidator{validator: validate}
}
