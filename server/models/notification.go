package models

import (
	"time"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type Notification struct {
	ID        surrealModels.RecordID `json:"id" swaggertype:"object"`
	User      surrealModels.RecordID `json:"user" swaggertype:"object"`
	Type      string                 `json:"type"`
	ExtraData map[string]any         `json:"extraData"`
	Message   string                 `json:"message"`
	Read      bool                   `json:"read"`
	ReadAt    *time.Time             `json:"read_at"`
	CreatedAt time.Time              `json:"created_at"`
}

// REVIEW - En algunos extraData hay image, eso guarda la imagen del usuario EN EL MOMENTO
// osea si el usuario cambia su imagen, la notificacion seguira teniendo la imagen antigua

// Si se quiere que sea siempre la actual lo mejor es guardar un future en surrealDb
