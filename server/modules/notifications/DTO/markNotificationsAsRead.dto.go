package DTO

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type MarkNotificationsAsReadDTO struct {
	Notifications []surrealModels.RecordID `json:"notifications" validate:"required,min=1" swaggertype:"array,object"`
}
