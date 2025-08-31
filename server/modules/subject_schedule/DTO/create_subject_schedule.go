package DTO

import "github.com/surrealdb/surrealdb.go/pkg/models"

type CreateSubjectSchedule struct {
	Schedules      []Schedule      `json:"schedules" validate:"required"`
	SubjectOfferId models.RecordID `json:"subject_offer_id" validate:"required"`
}

type Schedule struct {
	DayOfWeek    int        `json:"day_of_week" validate:"required,min=0,max=6"`
	StartingTime HourMinute `json:"starting_time" validate:"required"`
	Ending_time  HourMinute `json:"ending_time" validate:"required"`
}

type HourMinute struct {
	Hours   int `json:"hours" validate:"required,min=0,max=23"`
	Minutes int `json:"minutes" validate:"required,min=0,max=59"`
}
