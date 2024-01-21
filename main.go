package main

import (
	"fmt"
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
		// ctx := context.Background()

		// greeting, err := db.HelloWorld(ctx)
		// if err != nil {
		// 	print(greeting)
		// }
		return c.String(http.StatusOK, "Hola")
	})

	e.GET("/subjects/:career", func(c echo.Context) error {
		career := c.Param("career")
		println(fmt.Sprintf("Career: %s", career))

		subjects, err := db.GetSubjectByCareer(c.Request().Context(), career)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		println(fmt.Sprintf("Subjects: %v", subjects))

		return c.JSON(http.StatusOK, subjects)
	})

	// Servir el frontend ya compilado en todas las rutas no tomadas
	// Ya el frontend se encargara de manejarlas con react router
	e.Static("/*", "build")

	e.Logger.Fatal(e.Start(":6969"))

}
