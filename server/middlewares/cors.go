package middlewares

import (
	"net/http"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func Cors() echo.MiddlewareFunc {
	return echoMiddleware.CORSWithConfig(
		echoMiddleware.CORSConfig{
			AllowOriginFunc: func(origin string) (bool, error) {
				// ESTO ES SOLO PARA PRUEBAS
				return true, nil
			}, AllowHeaders: []string{
				echo.HeaderOrigin,
				echo.HeaderContentType,
				echo.HeaderAccept,
				echo.HeaderAuthorization,
				echo.HeaderXRequestedWith,
			},
			AllowCredentials: true,
			Skipper:          echoMiddleware.DefaultSkipper,
			AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete, http.MethodOptions},
		},
	)
}
