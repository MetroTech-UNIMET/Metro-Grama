package main

import (
	"fmt"
	"metrograma/auth"
	"metrograma/db"
	"metrograma/env"
	"metrograma/handlers"
	"metrograma/middlewares"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"

	docs "metrograma/docs"

	echoSwagger "github.com/swaggo/echo-swagger"
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
	// e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Gzip())
	e.Use(echoMiddleware.Decompress())
	e.Use(echoMiddleware.StaticWithConfig(echoMiddleware.StaticConfig{
		Skipper: func(c echo.Context) bool {
			return strings.HasPrefix(c.Path(), "/api")
		},
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

	docs.SwaggerInfo.Title = "MetroGrama API"
	docs.SwaggerInfo.Description = "MetroGrama API documentation"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.Host = fmt.Sprintf("localhost:%s", env.GetDotEnv("PORT"))
	docs.SwaggerInfo.BasePath = "/api"
	docs.SwaggerInfo.Schemes = []string{"http"}
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", env.GetDotEnv("PORT"))))

}
