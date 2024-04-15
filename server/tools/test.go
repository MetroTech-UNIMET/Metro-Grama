package tools

import (
	"metrograma/db"
	"metrograma/middlewares"

	"github.com/labstack/echo/v4"
)

func SetupEcho() *echo.Echo {
	db.InitSurrealDB()

	e := echo.New()
	e.Validator = middlewares.NewValidator()
	return e
}
