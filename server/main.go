package main

import (
	"metrograma/db"
	"metrograma/env"
	"metrograma/handlers"
	"metrograma/middlewares"

	"github.com/labstack/echo/v4"
)

func main() {
	env.LoadDotEnv()
	db.InitSurrealDB()

	e := echo.New()
	e.Validator = middlewares.NewValidator()

	e.Use(middlewares.Cors())

	handlers.CreateHandlers(e)

	// Servir el frontend ya compilado en todas las rutas no tomadas
	// Ya el frontend se encargara de manejarlas con react router
	e.Static("/*", "www-build")

	e.Logger.Fatal(e.Start(":6969"))

}
