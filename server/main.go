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

// Swagger global metadata and security
// @title           MetroGrama API
// @version         1.0
// @description     MetroGrama API documentation.<br><br><b>Google Login:</b> <a href="/api/auth/google/login?redirect=/swagger/index.html" target="_blank">Login with Google</a><br>After logging in and being redirected back, return to this page and use protected endpoints.
// @BasePath        /api
// @securityDefinitions.apikey CookieAuth
// @in              cookie
// @name            auth

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

	docs.SwaggerInfo.Host = fmt.Sprintf("localhost:%s", env.GetDotEnv("PORT"))
	docs.SwaggerInfo.BasePath = "/api"
	docs.SwaggerInfo.Schemes = []string{"http"}
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%s", env.GetDotEnv("PORT"))))

}
