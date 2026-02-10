package DTO

import (
	"metrograma/models"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// QueryCourse represents a principal section with its schedules.
type QueryCourse struct {
	ClassroomCode   *string                 `json:"clasroom_code" swaggertype:"string"`
	ID              surrealModels.RecordID  `json:"id" swaggertype:"object"`
	SectionNumber   int                     `json:"section_number"`
	Subject         models.SubjectEntity    `json:"subject"`
	SubjectOffer    surrealModels.RecordID  `json:"subject_offer" swaggertype:"object"`
	SubjectSchedule []SubjectScheduleEntity `json:"subject_schedule"`
}

// SubjectScheduleEntity mirrors subject_schedule table rows.
type SubjectScheduleEntity struct {
	ID             surrealModels.RecordID `json:"id" swaggertype:"object"`
	DayOfWeek      int                    `json:"day_of_week"`
	StartingHour   int                    `json:"starting_hour"`
	StartingMinute int                    `json:"starting_minute"`
	EndingHour     int                    `json:"ending_hour"`
	EndingMinute   int                    `json:"ending_minute"`
}
