package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"metrograma/auth"
	"metrograma/db"
	"metrograma/env"
	"metrograma/handlers"
	"metrograma/middlewares"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	prettylogger "github.com/rdbell/echo-pretty-logger"

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
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	env.LoadDotEnv()
	db.InitSurrealDB()
	auth.InitGoogleOauth()

	e := echo.New()
	e.Validator = middlewares.NewValidator()

	e.Use(echoMiddleware.RecoverWithConfig(echoMiddleware.RecoverConfig{
		StackSize:         4 << 10, // 4 KB
		DisableStackAll:   false,
		DisablePrintStack: false,
		LogErrorFunc: func(c echo.Context, err error, stack []byte) error {
			slog.Error("panic recovered",
				"error", err,
				"method", c.Request().Method,
				"path", c.Request().URL.Path,
				"stack", string(stack),
			)
			return nil
		},
	}))
	e.Use(echoMiddleware.RequestID())

	e.Use(middlewares.Cors())

	store := sessions.NewCookieStore([]byte(env.UserTokenSigninKey))
	store.Options.HttpOnly = true
	store.Options.Path = "/"
	if env.IsProduction {
		store.Options.SameSite = http.SameSiteNoneMode
		store.Options.Secure = true
	} else {
		store.Options.SameSite = http.SameSiteLaxMode
		store.Options.Secure = false
	}

	e.Use(session.Middleware(store))
	e.Use(middlewares.GlobalRateLimit())
	e.Use(echoMiddleware.BodyLimit("2M"))
	// e.Use(echoMiddleware.Logger())

	e.Use(prettylogger.Logger)
	e.Use(echoMiddleware.Gzip())
	e.Use(echoMiddleware.Decompress())

	handlers.CreateHandlers(e)

	if !env.IsProduction {
		docs.SwaggerInfo.Host = fmt.Sprintf("localhost:%s", env.GetDotEnv("PORT"))
		docs.SwaggerInfo.BasePath = "/api"
		docs.SwaggerInfo.Schemes = []string{"http"}

		// La ruta solo existirá en desarrollo/staging
		e.GET("/swagger/*", echoSwagger.WrapHandler)
	}

	go func() {
		port := env.GetDotEnv("PORT")
		if err := e.Start(fmt.Sprintf(":%s", port)); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("server error", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Graceful shutdown with 10-second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal("forced shutdown", err)
	}
	log.Println("Server stopped gracefully")
}

// TODO
// BE-M2: Every DB call uses context.Background() instead of request context
// Files: 82 occurrences across 46 files

// Problem: When a client disconnects (closes browser, network timeout), the DB query continues running. This means:

// Long-running queries block server resources after clients give up
// No request timeout propagation
// No request tracing context propagation
// Memory and goroutine leaks under load
// Fix — propagate request context through the call chain:

// Add context.Context as the first parameter to all service functions:
// // Before:
// func GetCareers() ([]models.CareerEntity, error) {
//     result, err := surrealdb.Query[...](context.Background(), db.SurrealDB, ...)

// // After:
// func GetCareers(ctx context.Context) ([]models.CareerEntity, error) {
//     result, err := surrealdb.Query[...](ctx, db.SurrealDB, ...)
// Pass the request context from handlers:
// func getCareers(c echo.Context) error {
//     careers, err := services.GetCareers(c.Request().Context())
//     // ...
// }
// This is a large refactor. Prioritize: auth services (high traffic), notification services (long-running), and any service that builds complex queries.
