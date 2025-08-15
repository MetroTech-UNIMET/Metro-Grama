package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type TrimesterEntity struct {
	ID           surrealModels.RecordID       `json:"id" validate:"required"  swaggertype:"object"`
	StartingDate surrealModels.CustomDateTime `json:"starting_date" validate:"required" swaggertype:"string"`
	EndingDate   surrealModels.CustomDateTime `json:"ending_date" validate:"required" swaggertype:"string"`
	Intensive    bool                         `json:"intensive" validate:"required"`
}
