package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/subject_schedule/DTO"

	"github.com/surrealdb/surrealdb.go"
)

const createSubjectScheduleQuery = `
BEGIN TRANSACTION;
    DELETE subject_schedule
        WHERE subject_offer = $subject_offer_id;

    FOR $schedule IN $schedules {
				CREATE subject_schedule SET
            day_of_week = $schedule.day_of_week,
            starting_hour = $schedule.starting_time.hours,
            starting_minute = $schedule.starting_time.minutes,
            ending_hour = $schedule.ending_time.hours,
            ending_minute = $schedule.ending_time.minutes,
            subject_offer = $subject_offer_id;
    };

    RETURN SELECT * FROM subject_schedule
        WHERE subject_offer = $subject_offer_id;
COMMIT TRANSACTION;
`

// CreateSubjectSchedule persists the provided schedules to the database.
func CreateSubjectSchedule(input DTO.CreateSubjectSchedule) ([]models.SubjectScheduleEntity, error) {
	queryParams := map[string]any{
		"schedules":        input.Schedules,
		"subject_offer_id": input.SubjectOfferId,
	}
	result, err := surrealdb.Query[[]models.SubjectScheduleEntity](context.Background(), db.SurrealDB, createSubjectScheduleQuery, queryParams)
	if err != nil {
		return nil, err
	}
	schedules := (*result)[0].Result

	return schedules, err
}
