package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type EnrollEntity struct {
	ID  surrealModels.RecordID `json:"id" validate:"required" swaggertype:"object"`
	In  surrealModels.RecordID `json:"in" validate:"required" swaggertype:"object"`
	Out surrealModels.RecordID `json:"out" validate:"required" swaggertype:"object"`

	Trimester surrealModels.RecordID `json:"trimester" validate:"required" swaggertype:"object"`

	Grade      int `json:"grade" validate:"required"`
	Difficulty int `json:"difficulty" validate:"required"`
	Workload   int `json:"workload" validate:"required"`
}
