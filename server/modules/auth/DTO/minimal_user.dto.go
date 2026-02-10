package DTO

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type MinimalUser struct {
	ID   surrealModels.RecordID `json:"id" swaggertype:"object"`
	Role surrealModels.RecordID `json:"role" swaggertype:"object"`
}
