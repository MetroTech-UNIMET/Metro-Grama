package DTO

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type CreateSubjectSchedule struct {
	Sections       []sections             `json:"sections" validate:"required"`
	SubjectOfferId surrealModels.RecordID `json:"subject_offer_id" validate:"required" swaggertype:"object"`
}

type sections struct {
	SectionNumber int        `json:"section_number" validate:"required"`
	ClassRoomCode *string    `json:"classroom_code"`
	Schedules     []schedule `json:"schedules" validate:"required"`
}

type schedule struct {
	DayOfWeek    int        `json:"day_of_week" validate:"required,min=0,max=6"`
	StartingTime hourMinute `json:"starting_time" validate:"required"`
	EndingTime   hourMinute `json:"ending_time" validate:"required"`
}

type hourMinute struct {
	Hours   int `json:"hours" validate:"required,min=0,max=23"`
	Minutes int `json:"minutes" validate:"required,min=0,max=59"`
}
