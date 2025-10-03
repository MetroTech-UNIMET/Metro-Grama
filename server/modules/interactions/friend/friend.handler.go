package friend

import (
	"fmt"
	"net/http"

	authMiddlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/interactions/friend/services"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// TODO - Add spetial throttling middleware to avoid spamming friend requests
func Handlers(e *echo.Group) {
	grp := e.Group("/friend", authMiddlewares.StudentAuth)
	grp.POST("/add/:studentToAdd", addFriend)
	grp.POST("/accept/:studentToAccept", acceptFriend)
	grp.DELETE("/eliminate/:studentToEliminate", eliminateFriend)
}

// addFriend godoc
// @Summary Add a friend
// @Description Relates the authenticated student with another student as friends
// @Tags friend
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param studentToAdd path string true "Student ID to add as friend (recordID: student:xxxx)"
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /friend/add/{studentToAdd} [post]
func addFriend(c echo.Context) error {
	// current student from session
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	me, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user ID")
	}

	// student to add from path
	toAddParam := c.Param("studentToAdd")
	if toAddParam == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing studentToAdd")
	}
	toAdd := surrealModels.NewRecordID("student", toAddParam)

	data, err := services.RelateFriends(me, toAdd)
	if err != nil {
		fmt.Println("Error relating friends:", err)
		return err
	}

	return c.JSON(http.StatusCreated, map[string]any{
		"message": "Amigo agregado correctamente",
		"data":    data,
	})
}

// eliminateFriend godoc
// @Summary Remove a friend
// @Description Unrelates the authenticated student from another student
// @Tags friend
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param studentToEliminate path string true "Student ID to remove as friend (recordID: student:xxxx)"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /friend/eliminate/{studentToEliminate} [delete]
func eliminateFriend(c echo.Context) error {
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	me, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user ID")
	}

	toEliminateParam := c.Param("studentToEliminate")
	if toEliminateParam == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing studentToEliminate")
	}
	other := surrealModels.NewRecordID("student", toEliminateParam)

	data, err := services.UnrelateFriends(me, other)
	if err != nil {
		fmt.Println("Error unrelating friends:", err)
		return err
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message": "Amistad eliminada",
		"data":    data,
	})
}

// acceptFriend godoc
// @Summary Accept a friend request
// @Description Accepts a pending friend request from another student
// @Tags friend
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param studentToAccept path string true "Student ID whose friend request to accept (recordID: student:xxxx)"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /friend/accept/{studentToAccept} [post]
func acceptFriend(c echo.Context) error {
	raw := c.Get("student-id")
	if raw == nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}
	me, ok := raw.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid user ID")
	}

	// student to add from path
	toAcceptParam := c.Param("studentToAccept")
	if toAcceptParam == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing studentToAccept")
	}
	studentToAccept := surrealModels.NewRecordID("student", toAcceptParam)

	data, err := services.AcceptFriendshipRequest(me, studentToAccept)
	if err != nil {
		fmt.Println("Error accepting friend request:", err)
		return err
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message": "Solicitud de amistad aceptada",
		"data":    data,
	})
}
