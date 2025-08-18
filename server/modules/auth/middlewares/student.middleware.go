package middlewares

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"net/http"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func StudentAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		student, err := getStudentFromSession(c)
		if err != nil {
			return err
		}

		c.Set("user-id", student.User.ID)
		c.Set("student-id", student.ID)
		c.Set("student", student)

		return next(c)
	}
}

const getStudentQuery = `
SELECT * 
    FROM ONLY student 
    WHERE user = $userId
    FETCH user;`

func getStudentFromSession(c echo.Context) (*models.StudentEntity, error) {
	sessAuth, err := session.Get("auth", c)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "No se pudo obtener la sesión del estudiante")
	}

	userID, ok := sessAuth.Values["user-id"]
	if !ok {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "ID de usuario no encontrado en la sesión")
	}

	userIDStr, ok := userID.(string)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "ID de usuario no válido")
	}

	params := map[string]any{
		"userId": surrealModels.NewRecordID("user", userIDStr),
	}

	res, err := surrealdb.Query[models.StudentEntity](context.Background(), db.SurrealDB, getStudentQuery, params)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized)
	}

	student := (*res)[0].Result
	if !student.User.Verified {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "El estudiante no está verificado")
	}
	return &student, nil
}
