package users

import (
	"metrograma/middlewares"

	"metrograma/storage"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go/pkg/models"
)

// FIXME - Profile no sirve
func Handlers(e *echo.Group) {
	usersGroup := e.Group("/users")
	usersGroup.GET("/profile", userProfile, middlewares.UserAuth)
	// usersGroup.POST("/create_user", createStudent, middlewares.AdminAuth)
}

// func createStudent(c echo.Context) error {
// 	var signinForm models.StudentSigninForm
// 	if err := c.Bind(&signinForm); err != nil {
// 		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
// 	}

// 	if err := c.Validate(signinForm); err != nil {
// 		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
// 	}

// 	if err := tools.ExistRecord(signinForm.CareerID); err != nil {
// 		return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("career %s doesn't exist", signinForm.CareerID))
// 	}

// 	for _, s := range signinForm.SubjectsPassed {
// 		if err := tools.ExistRecord(s.ID); err != nil {
// 			return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("subject %s doesn't exist", s.ID))
// 		}
// 	}

// 	if err := storage.CreateStudent(signinForm); err != nil {
// 		return echo.NewHTTPError(http.StatusConflict, err)
// 	}

// 	return c.NoContent(http.StatusCreated)
// }

func userProfile(c echo.Context) error {
	userID := c.Get("user-id")
	if userID == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	student, err := storage.GetUser(userID.(models.RecordID))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound)
	}

	return c.JSON(http.StatusOK, student)
}
