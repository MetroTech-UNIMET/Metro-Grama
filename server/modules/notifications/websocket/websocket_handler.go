package websocket

import (
	"encoding/json"
	"fmt"
	"net/http"

	"metrograma/models"
	DTO "metrograma/modules/notifications/DTO"
	"metrograma/modules/notifications/services"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

var wsUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// SubscribeNotifications upgrades the connection to a websocket and streams notification events.
// @Summary      Subscribe to notifications stream
// @Description  Opens a websocket that pushes notification events to the authenticated user.
// @Tags         notifications
// @Security     CookieAuth
// @Success      101 {string} string "Switching Protocols"
// @Failure      400 {object} map[string]string
// @Failure      401 {object} map[string]string
// @Router       /notifications/ws [get]
func SubscribeNotifications(c echo.Context) error {
	rawUserID := c.Get("user-id")
	if rawUserID == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "userId es requerido")
	}

	userID, ok := rawUserID.(surrealModels.RecordID)
	if !ok {
		return echo.NewHTTPError(http.StatusBadRequest, "userId inválido")
	}

	conn, err := wsUpgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	hub := getHub()
	client := newClient(hub, conn, userID, handleInboundEvent)
	hub.register <- client

	go client.writePump()
	go client.readPump()

	notifications, err := services.GetNotificationsByUser(userID)
	if err != nil {
		client.sendError("fetch_failed", err.Error())
		return nil
	}

	_ = client.enqueue(EmitEvents.NotificationsBulk, notifications)
	return nil
}

func handleInboundEvent(c *client, msg inboundMessage) {
	fmt.Println(msg.Event)
	switch msg.Event {
	case ListenEvents.NotificationsMarkRead:
		fmt.Println("Handling mark read event")
		handleMarkAsReadEvent(c, msg.Payload)

	default:
		c.sendError("unknown_event", "evento no soportado")
	}
}

func handleMarkAsReadEvent(c *client, payload json.RawMessage) {
	var body DTO.MarkNotificationsAsReadDTO
	if err := json.Unmarshal(payload, &body); err != nil {
		c.sendError("invalid_payload", err.Error())
		return
	}
	if len(body.Notifications) == 0 {
		c.sendError("invalid_payload", "notifications es requerido")
		return
	}

	updatedNotifications, err := services.MarkNotificationsAsRead(c.userID, body.Notifications)
	if err != nil {
		c.sendError("mark_failed", err.Error())
		return
	}

	_ = getHub().Broadcast(c.userID, EmitEvents.NotificationsUpdated, updatedNotifications)
}

// EmitNewNotification broadcasts a `notifications:new` event to the provided user.
func EmitNewNotification(notif models.Notification) error {
	return BroadcastToUser(notif.User, EmitEvents.NotificationsNew, notif)
}

func EmitNewNotifications(notifications []models.Notification) error {
	for _, notif := range notifications {
		if err := EmitNewNotification(notif); err != nil {
			return err
		}
	}
	return nil
}
