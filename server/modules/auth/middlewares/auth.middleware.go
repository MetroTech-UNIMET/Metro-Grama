package middlewares

import (
	"metrograma/modules/auth/DTO"
	"metrograma/modules/auth/services"
	"net/http"
	"strings"

	crudServices "metrograma/modules/auth/services/crud"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UserAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := getUserFromToken(c)
		if err != nil {
			return err
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}

func AdminAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := getUserFromToken(c)
		if err != nil {
			return err
		}

		if user.Role.ID != "admin" {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}

func getUserFromToken(c echo.Context) (*DTO.MinimalUser, error) {
	token, err := extractBearerOrQueryToken(c)
	if err != nil {
		return nil, err
	}

	claims, err := services.ParseAccessToken(token)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}

	user, err := crudServices.ExistUser(surrealModels.NewRecordID("user", claims.UserID))
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}

	return &user, nil
}

func extractBearerOrQueryToken(c echo.Context) (string, error) {
	authHeader := c.Request().Header.Get(echo.HeaderAuthorization)
	if authHeader != "" {
		parts := strings.Fields(authHeader)
		if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
			return parts[1], nil
		}
	}

	if token := c.QueryParam("token"); token != "" {
		return token, nil
	}

	return "", echo.NewHTTPError(http.StatusUnauthorized)
}
