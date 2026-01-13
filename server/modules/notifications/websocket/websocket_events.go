package websocket

import "encoding/json"

// EmitEvents are events the server emits to clients.
var EmitEvents = struct {
	NotificationsBulk    string
	NotificationsNew     string
	NotificationsUpdated string
	ConnectionError      string
}{
	NotificationsBulk:    "notifications:bulk",
	NotificationsNew:     "notifications:new",
	NotificationsUpdated: "notifications:updated",
	ConnectionError:      "connection:error",
}

// ListenEvents are events the server listens for from clients.
var ListenEvents = struct {
	NotificationsMarkRead string
}{
	NotificationsMarkRead: "notifications:markRead",
}

// websocketMessage is the envelope we use to communicate with the client.
type websocketMessage struct {
	Event   string `json:"event"`
	Payload any    `json:"payload"`
}

// inboundMessage represents client-originated events.
type inboundMessage struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}

// errorPayload is sent when the server needs to report a recoverable issue.
type errorPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
