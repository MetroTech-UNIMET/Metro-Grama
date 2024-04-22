package main

import (
	"metrograma/db"
	"metrograma/env"
	"metrograma/handlers"
	"metrograma/middlewares"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	env.LoadDotEnv()
	db.InitSurrealDB()

	e := echo.New()
	e.Validator = middlewares.NewValidator()

	e.Use(middlewares.Cors())
	e.Use(echoMiddleware.BodyLimit("2M"))

	handlers.CreateHandlers(e)

	// Servir el frontend ya compilado en todas las rutas no tomadas
	// Ya el frontend se encargara de manejarlas con react router
	e.Static("/*", "www-build")

	e.Logger.Fatal(e.Start(":6969"))

}
