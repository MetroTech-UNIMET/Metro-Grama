package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectSectionHistory struct {
	ID surrealModels.RecordID `json:"id" validate:"required"  swaggertype:"object"`

	Schedules      []surrealModels.RecordID `json:"schedules" swaggertype:"array,object"`
	SubjectSection surrealModels.RecordID   `json:"subject_section" swaggertype:"object"`
	UserId         surrealModels.RecordID   `json:"user_id" swaggertype:"object"`

	StartDate surrealModels.CustomDateTime  `json:"start_date"`
	EndDate   *surrealModels.CustomDateTime `json:"end_date,omitempty"`

	NewData SubjectSectionEntity `json:"new_data,omitempty"`
}

type SubjectSectionHistoryWithSchedules struct {
	SubjectSectionHistory
	Schedules []SubjectScheduleEntity `json:"schedules"`
}
