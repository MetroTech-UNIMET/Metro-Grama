package main

import (
	"fmt"
	"metrograma/auth"
	"metrograma/db"
	"metrograma/env"
	"metrograma/handlers"
	"metrograma/middlewares"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	env.LoadDotEnv()
	db.InitSurrealDB()
	auth.InitGoogleOauth()

	e := echo.New()
	e.Validator = middlewares.NewValidator()

	e.Use(session.Middleware(sessions.NewCookieStore([]byte(env.UserTokenSigninKey))))
	e.Use(middlewares.Cors())
	e.Use(echoMiddleware.BodyLimit("2M"))
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Gzip())
	e.Use(echoMiddleware.Decompress())
	e.Use(echoMiddleware.StaticWithConfig(echoMiddleware.StaticConfig{
		Skipper: nil,
		// Root directory from where the static content is served.
		Root: "www-build",
		// Index file for serving a directory.
		// Optional. Default value "index.html".
		Index: "index.html",
		// Enable HTML5 mode by forwarding all not-found requests to root so that
		// SPA (single-page application) can handle the routing.
		HTML5:      true,
		Browse:     false,
		IgnoreBase: false,
		Filesystem: nil,
	}))

	handlers.CreateHandlers(e)

	// Servir el frontend ya compilado en todas las rutas no tomadas
	// Ya el frontend se encargara de manejarlas con react router
	e.Static("/*", "www-build")

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", env.GetDotEnv("PORT"))))

}
