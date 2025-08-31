package DTO

import (
	"metrograma/models"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type QueryAnnualOffer struct {
	models.AnnualOfferEntity
	Schedules []models.SubjectScheduleEntity `json:"schedules"`
	Careers   []surrealModels.RecordID       `json:"careers" swaggertype:"array,object"`
}
