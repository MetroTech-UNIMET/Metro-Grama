package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectOfferEntity struct {
	Id        surrealModels.RecordID `json:"id" swaggertype:"object"`
	Subject   SubjectEntity          `json:"subject"`
	Trimester TrimesterEntity        `json:"trimester"`
}
