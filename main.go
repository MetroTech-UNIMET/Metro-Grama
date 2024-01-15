package main

import (
	"metrograma/db"
	"metrograma/env"
	"net/http"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	env.LoadDotEnv()
	db.InitNeo4j()

	e := echo.New()

	// CORS
	e.Use(echoMiddleware.CORSWithConfig(
		echoMiddleware.CORSConfig{
			AllowOrigins: []string{"url al localhost de react"},
			AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		},
	))

	e.GET("/hola", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	// Servir el frontend ya compilado en todas las rutas no tomadas
	// Ya el frontend se encargara de manejarlas con react router
	e.Static("/*", "build")

	e.Logger.Fatal(e.Start(":6969"))
}
