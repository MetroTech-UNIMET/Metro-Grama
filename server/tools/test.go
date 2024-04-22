package tools

import (
	"metrograma/db"
	"metrograma/middlewares"
	"os"

	"github.com/labstack/echo/v4"
)

func SetupEcho() *echo.Echo {
	os.Setenv("SURREAL_HOST", "localhost:8000")
	os.Setenv("SURREAL_USER", "root")
	os.Setenv("SURREAL_PASS", "root")
	os.Setenv("SURREAL_NS", "test")
	os.Setenv("SURREAL_DB", "test")

	db.InitSurrealDB()

	e := echo.New()
	e.Validator = middlewares.NewValidator()
	return e
}
