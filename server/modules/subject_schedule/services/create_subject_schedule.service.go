package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	notificationServices "metrograma/modules/notifications/services"
	notificationws "metrograma/modules/notifications/websocket"
	"metrograma/modules/subject_schedule/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealmodels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// CreateSubjectSchedule persists the provided schedules to the database.
func CreateSubjectSchedule(input DTO.CreateSubjectSchedule, userId surrealmodels.RecordID) ([]models.SubjectScheduleEntity, error) {
	sectionsToCreate, sectionsToUpdate := separateSections(input.Sections)

	createSubjectScheduleQB_Update := getCreateSubjectScheduleQB().
		Set("subject_section = $section.subject_section_id")
	createSubjectScheduleQB_Create := getCreateSubjectScheduleQB().
		Set("subject_section = $sectionId")

	updateHistory_SectionsQB_Update := getUpdateHistory_SectionsQB("subject_section = $section.subject_section_id")
	updateHistory_SectionsQB_Create := getUpdateHistory_SectionsQB("subject_section = $sectionId")

	qb := surrealql.Begin().
		Do(surrealql.For("section", "?", sectionsToUpdate).
			Let("DIFF", surrealql.UpdateOnly("subject_section").
				Set("classroom_code = $section.classroom_code ?? NONE").
				Set("section_number = $section.section_number").
				Set("subject_offer = $subject_offer_id").
				Where("id = $section.subject_section_id").
				ReturnDiff()).
			Do(surrealql.Delete("subject_schedule").
				Where("subject_section = $section.subject_section_id")).
			Do(surrealql.For("schedule", "$section.schedules").
				Do(createSubjectScheduleQB_Update)).
			If("!$DIFF").
			Then(func(tb *surrealql.ThenBuilder) {
				// En el caso borde de que no se modifique el subject_section, pero si se modifiquen los horarios,
				// el update no activa el evento subject_section_audit, por lo que lo actualizamos manualmente aquí.
				tb.Do(
					surrealql.Update("subject_section_history").
						Set("end_date = time::now()").
						Where("subject_section = $section.subject_section_id AND end_date = NONE"),
				)
				tb.Let("subject_section_data",
					surrealql.SelectOnly("$section.subject_section_id").
						Field("*"))
				tb.Do(
					surrealql.Create("subject_section_history").
						Set("subject_section = $section.subject_section_id").
						Set("user_id = $updated_by").
						Set("new_data = $subject_section_data").
						Set("start_date = time::now()").
						Set("end_date = NONE"),
					// Content(map[string]any{
					// 	"subject_section": surrealql.Expr("$section.subject_section_id"),
					// 	"user_id":         surrealql.Expr("$updated_by"),
					// 	"new_data":        surrealql.Expr("$subject_section_data"),
					// 	"start_date":      surrealql.Expr("time::now()"),
					// 	"end_date":        surrealmodels.None,
					// }),
				)
			}).End().
			Do(updateHistory_SectionsQB_Update),
		).
		Do(surrealql.For("section", "?", sectionsToCreate).
			Let("sectionId", surrealql.CreateOnly("subject_section").
				Set("classroom_code = $section.classroom_code ?? NONE").
				Set("section_number = $section.section_number").
				Set("subject_offer = $subject_offer_id").
				Return("VALUE id")).
			Do(surrealql.For("schedule", "$section.schedules").
				Do(createSubjectScheduleQB_Create)).
			Do(updateHistory_SectionsQB_Create),
		).
		Return("?", surrealql.Select("subject_schedule").
			Field("*").
			Where("subject_offer = $subject_offer_id"))

	sql, params := qb.Build()

	params["subject_offer_id"] = input.SubjectOfferId
	params["updated_by"] = userId

	result, err := surrealdb.Query[[]models.SubjectScheduleEntity](context.Background(), db.SurrealDB, sql, params)
	if err != nil {
		return nil, err
	}
	schedules := (*result)[0].Result

	subjectSectionIds := make([]surrealmodels.RecordID, 0, len(sectionsToUpdate))
	for _, sec := range sectionsToUpdate {
		if sec.SubjectSectionId != nil {
			subjectSectionIds = append(subjectSectionIds, *sec.SubjectSectionId)
		}
	}

	notifications, err := notificationServices.GetNotificationsSubjectSectionUpdate(subjectSectionIds)
	if err != nil {
		return nil, err
	}

	err = notificationws.EmitNewNotifications(notifications)
	if err != nil {
		return nil, err
	}

	return schedules, err
}

func separateSections(sections []DTO.SectionsDTO) (toCreate []DTO.SectionsDTO, toUpdate []DTO.SectionsDTO) {
	toUpdate = make([]DTO.SectionsDTO, 0, len(sections))
	toCreate = make([]DTO.SectionsDTO, 0, len(sections))

	for _, section := range sections {
		if section.SubjectSectionId != nil {
			toUpdate = append(toUpdate, section)
		} else {
			toCreate = append(toCreate, section)
		}
	}
	return toCreate, toUpdate
}

func getCreateSubjectScheduleQB() *surrealql.CreateQuery {
	return surrealql.Create("subject_schedule").
		Set("day_of_week = $schedule.day_of_week").
		Set("starting_hour = $schedule.starting_time.hours").
		Set("starting_minute = $schedule.starting_time.minutes").
		Set("ending_hour = $schedule.ending_time.hours").
		Set("ending_minute = $schedule.ending_time.minutes")
}

func getUpdateHistory_SectionsQB(subject_section_condition string) *surrealql.UpdateQuery {
	return surrealql.Update("subject_section_history").
		Set("schedules = ?",
			surrealql.Select("subject_schedule").
				Value("id").
				Where(subject_section_condition)).
		Where(subject_section_condition).
		Where("end_date = NONE")
}
