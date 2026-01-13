package websocket

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
)

type inboundHandler func(*client, inboundMessage)

// client represents a single websocket connection for a user.
type client struct {
	hub     *Hub
	conn    *websocket.Conn
	send    chan []byte
	userID  surrealModels.RecordID
	userKey string
	handler inboundHandler
}

func newClient(hub *Hub, conn *websocket.Conn, userID surrealModels.RecordID, handler inboundHandler) *client {
	return &client{
		hub:     hub,
		conn:    conn,
		send:    make(chan []byte, 16),
		userID:  userID,
		userKey: userID.String(),
		handler: handler,
	}
}

func (c *client) readPump() {
	defer func() {
		c.hub.unregister <- c
		_ = c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var msg inboundMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			c.sendError("invalid_payload", err.Error())
			continue
		}

		if msg.Event == "" {
			c.sendError("missing_event", "event is required")
			continue
		}

		c.handler(c, msg)
	}
}

func (c *client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		_ = c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if err := c.conn.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
				return
			}
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.conn.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
				return
			}
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *client) enqueue(event string, payload interface{}) error {
	data, err := json.Marshal(websocketMessage{Event: event, Payload: payload})
	if err != nil {
		return err
	}

	select {
	case c.send <- data:
	default:
		return nil
	}
	return nil
}

func (c *client) sendError(code, message string) {
	_ = c.enqueue(EmitEvents.ConnectionError, errorPayload{Code: code, Message: message})
}
