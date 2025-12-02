package notifications

import (
	"net/http"

	"metrograma/middlewares"
	authMiddlewares "metrograma/modules/auth/middlewares"
	DTO "metrograma/modules/notifications/DTO"
	"metrograma/modules/notifications/services"
	notificationsws "metrograma/modules/notifications/websocket"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(group *echo.Group) {
	notificationsGroup := group.Group("/notifications", authMiddlewares.UserAuth)
	notificationsGroup.GET("/", getNotificationsByUser)
	// Write operations have rate limiting (50 req/min per IP)
	notificationsGroup.PUT("/mark-as-read", markNotificationsAsRead, middlewares.WriteRateLimit())
	notificationsGroup.GET("/ws", notificationsws.SubscribeNotifications)
}

// getNotificationsByUser godoc
// @Summary      Get user notifications
// @Description  Returns the list of notifications for the provided logged user ID.
// @Tags         notifications
// @Accept       json
// @Produce      json
// @Security CookieAuth
// @Success      200 {object} DTO.NotificationDTO
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /notifications/ [get]
func getNotificationsByUser(c echo.Context) error {
	raw_userId := c.Get("user-id")
	if raw_userId == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "userId es requerido")
	}

	userID, ok := raw_userId.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "userId inválido")
	}

	notifications, err := services.GetNotificationsByUser(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message": "Notificaciones obtenidas correctamente",
		"data":    notifications,
	})
}

// markNotificationsAsRead godoc
// @Summary      Mark notifications as read
// @Description  Marks the provided notifications as read for the authenticated user
// @Tags         notifications
// @Accept       json
// @Produce      json
// @Security CookieAuth
// @Param        payload  body  DTO.MarkNotificationsAsReadDTO  true  "Notifications IDs"
// @Success      200 {object} map[string]any
// @Failure      400 {object} map[string]string
// @Failure      401 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /notifications/mark-as-read [put]
func markNotificationsAsRead(c echo.Context) error {
	rawUserID := c.Get("user-id")
	if rawUserID == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "userId es requerido")
	}

	userID, ok := rawUserID.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "userId inválido")
	}

	var body DTO.MarkNotificationsAsReadDTO
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	updatedNotifications, err := services.MarkNotificationsAsRead(userID, body.Notifications)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message": "Notificaciones marcadas como leídas",
		"data":    updatedNotifications,
	})
}
