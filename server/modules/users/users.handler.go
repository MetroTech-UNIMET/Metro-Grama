package users

import (
	authMiddlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/users/services"
	"net/http"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	usersGroup := e.Group("/users")
	usersGroup.GET("/profile", userProfile, authMiddlewares.UserAuth)
}

func userProfile(c echo.Context) error {
	userID := c.Get("user-id")
	if userID == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	student, err := services.GetUser(userID.(surrealModels.RecordID))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "El usuario no existe")
	}

	return c.JSON(http.StatusOK, student)
}
