package middlewares

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/auth/services"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func StudentAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		student, err := GetStudentFromSession(c)
		if err != nil {
			return err
		}

		c.Set("user-id", student.User.ID)
		c.Set("student-id", student.ID)
		c.Set("student", student)

		return next(c)
	}
}

func GetStudentFromSession(c echo.Context) (*models.StudentWithUser, error) {
	userIDStr, err := getUserIDFromToken(c)
	if err != nil {
		return nil, err
	}

	qb := surrealql.SelectOnly("student").
		Field("*").
		Where("user = ?", surrealModels.NewRecordID("user", userIDStr)).
		Fetch("user")

	sql, params := qb.Build()

	res, err := surrealdb.Query[models.StudentWithUser](context.Background(), db.SurrealDB, sql, params)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}

	student := (*res)[0].Result
	if !student.User.Verified {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "El estudiante no está verificado")
	}
	return &student, nil
}

func getUserIDFromToken(c echo.Context) (string, error) {
	authHeader := c.Request().Header.Get(echo.HeaderAuthorization)
	if authHeader != "" {
		parts := strings.Fields(authHeader)
		if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
			claims, err := services.ParseAccessToken(parts[1])
			if err != nil {
				return "", echo.NewHTTPError(http.StatusUnauthorized)
			}
			return claims.UserID, nil
		}
	}

	if token := c.QueryParam("token"); token != "" {
		claims, err := services.ParseAccessToken(token)
		if err != nil {
			return "", echo.NewHTTPError(http.StatusUnauthorized)
		}
		return claims.UserID, nil
	}

	return "", echo.NewHTTPError(http.StatusUnauthorized, "Token de usuario no encontrado")
}
