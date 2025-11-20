package DTO

import (
	"fmt"
	"sort"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type CreateSubjectSchedule struct {
	Sections       []SectionsDTO          `json:"sections" validate:"required"`
	SubjectOfferId surrealModels.RecordID `json:"subject_offer_id" validate:"required" swaggertype:"object"`
}

type SectionsDTO struct {
	SubjectSectionId *surrealModels.RecordID `json:"subject_section_id,omitempty" swaggertype:"object"`
	SectionNumber    int                     `json:"section_number" validate:"required"`
	ClassRoomCode    *string                 `json:"classroom_code"`
	Schedules        []schedule              `json:"schedules" validate:"required"`
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

// ValidateNoOverlaps checks that within each section schedules do not overlap on the same day
// and that each schedule has start < end. Returns slice of error messages (empty if valid).
func (c CreateSubjectSchedule) ValidateNoOverlaps() []string {
	errs := []string{}
	for si, section := range c.Sections {
		// Build grouped schedules by day
		grouped := map[int][]struct{ start, end int }{}
		for gi, sch := range section.Schedules {
			start := sch.StartingTime.Hours*60 + sch.StartingTime.Minutes
			end := sch.EndingTime.Hours*60 + sch.EndingTime.Minutes
			if start >= end {
				errs = append(errs, fmt.Sprintf("Sección %d horario %d: la hora de inicio debe ser anterior a la hora de fin", si+1, gi+1))
				continue
			}
			grouped[sch.DayOfWeek] = append(grouped[sch.DayOfWeek], struct{ start, end int }{start, end})
		}
		// Detect overlaps per day
		for day, list := range grouped {
			if len(list) < 2 {
				continue
			}
			sort.Slice(list, func(i, j int) bool {
				return list[i].start < list[j].start || (list[i].start == list[j].start && list[i].end < list[j].end)
			})
			prev := list[0]
			for i := 1; i < len(list); i++ {
				curr := list[i]
				if curr.start < prev.end { // overlap
					errs = append(errs, fmt.Sprintf("Sección %d día %d: hay horarios solapados", si+1, day))
					break // report once per day
				}
				prev = curr
			}
		}
	}
	return errs
}
