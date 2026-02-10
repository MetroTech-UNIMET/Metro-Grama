package middlewares

import (
	"metrograma/env"
	"net/http"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func Cors() echo.MiddlewareFunc {
	return echoMiddleware.CORSWithConfig(
		echoMiddleware.CORSConfig{
			AllowOrigins:     []string{env.GetDotEnv("FRONTEND_ADDRS")},
			AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, http.MethodGet, http.MethodPost},
			AllowCredentials: true,
			Skipper:          echoMiddleware.DefaultSkipper,
			AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
		},
	)
}
