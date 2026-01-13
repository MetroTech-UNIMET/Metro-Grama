package models

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type CareerEntity struct {
	ID                  surrealModels.RecordID `json:"id" validate:"required" swaggertype:"object"`
	Name                string                 `json:"name" validate:"required"`
	Emoji               string                 `json:"emoji" validate:"required"`
	ElectivesTrimesters []int                  `json:"electivesTrimesters"`
}
