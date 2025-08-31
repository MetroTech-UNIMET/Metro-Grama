package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectScheduleEntity struct {
	ID        surrealModels.RecordID `json:"id" validate:"required"  swaggertype:"object"`
	DayOfWeek int                    `json:"day_of_week" validate:"required,min=0,max=6"`

	StartingHour   int `json:"starting_hour" validate:"required,min=0,max=23"`
	StartingMinute int `json:"starting_minute" validate:"required,min=0,max=59"`

	EndingHour   int `json:"ending_hour" validate:"required,min=0,max=23"`
	EndingMinute int `json:"ending_minute" validate:"required,min=0,max=59"`

	SubjectOffer surrealModels.RecordID `json:"subject_offer" validate:"required" swaggertype:"object"`
}
