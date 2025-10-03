package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type FriendEntity struct {
	ID      surrealModels.RecordID       `json:"id" swaggertype:"object"`
	In      surrealModels.RecordID       `json:"in" swaggertype:"object"`
	Out     surrealModels.RecordID       `json:"out" swaggertype:"object"`
	Created surrealModels.CustomDateTime `json:"created" swaggertype:"string"`

	Status string `json:"status" validate:"required,oneof=pending accepted rejected"`
}
