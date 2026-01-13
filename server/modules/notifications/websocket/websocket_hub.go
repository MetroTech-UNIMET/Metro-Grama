package websocket

import (
	"encoding/json"
	"sync"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// Hub keeps track of websocket clients and handles fan-out per user.
type Hub struct {
	register   chan *client
	unregister chan *client
	broadcast  chan outboundMessage
	clients    map[string]map[*client]struct{}
}

type outboundMessage struct {
	userKey string
	data    []byte
}

var (
	notificationsHub *Hub
	hubOnce          sync.Once
)

func getHub() *Hub {
	hubOnce.Do(func() {
		notificationsHub = &Hub{
			register:   make(chan *client),
			unregister: make(chan *client),
			broadcast:  make(chan outboundMessage),
			clients:    make(map[string]map[*client]struct{}),
		}
		go notificationsHub.run()
	})
	return notificationsHub
}

func (h *Hub) run() {
	for {
		select {
		case wsClient := <-h.register:
			userSet := h.clients[wsClient.userKey]
			if userSet == nil {
				userSet = make(map[*client]struct{})
				h.clients[wsClient.userKey] = userSet
			}
			userSet[wsClient] = struct{}{}
		case wsClient := <-h.unregister:
			if userSet, ok := h.clients[wsClient.userKey]; ok {
				if _, ok := userSet[wsClient]; ok {
					delete(userSet, wsClient)
					close(wsClient.send)
				}
				if len(userSet) == 0 {
					delete(h.clients, wsClient.userKey)
				}
			}
		case message := <-h.broadcast:
			if userSet, ok := h.clients[message.userKey]; ok {
				for c := range userSet {
					select {
					case c.send <- message.data:
					default:
						close(c.send)
						delete(userSet, c)
					}
				}
				if len(userSet) == 0 {
					delete(h.clients, message.userKey)
				}
			}
		}
	}
}

// Broadcast pushes an event to every websocket connection that belongs to the provided user.
func (h *Hub) Broadcast(user surrealModels.RecordID, event string, payload interface{}) error {
	if h == nil {
		return nil
	}

	data, err := json.Marshal(websocketMessage{Event: event, Payload: payload})
	if err != nil {
		return err
	}

	h.broadcast <- outboundMessage{userKey: user.String(), data: data}
	return nil
}

// BroadcastToUser is a convenience exported wrapper so other packages can
// notify connected websocket clients without depending on hub internals.
func BroadcastToUser(user surrealModels.RecordID, event string, payload interface{}) error {
	hub := getHub()
	if hub == nil {
		return nil
	}
	return hub.Broadcast(user, event, payload)
}
