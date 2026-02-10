package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/modules/interactions/course/DTO"

	surrealdb "github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetSectionsWithSchedules retrieves principal or secondary sections (depending on isPrincipal) and their schedules for a student and trimester.
func GetSectionsWithSchedules(studentId surrealModels.RecordID, trimesterId string, isPrincipal bool) ([]DTO.QueryCourse, error) {

	qb := surrealql.SelectOnly("course").
		Value(GetSectionSubquery(isPrincipal)).
		WhereEq("out", surrealModels.NewRecordID("trimester", trimesterId)).
		WhereEq("in", studentId)

	sql, vars := qb.Build()

	res, err := surrealdb.Query[[]DTO.QueryCourse](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return nil, err
	}
	if res == nil || len(*res) == 0 {
		return []DTO.QueryCourse{}, nil
	}
	sections := (*res)[0].Result
	if sections == nil {
		return []DTO.QueryCourse{}, nil
	}
	return sections, nil
}

func getScheduleSubquery() *surrealql.SelectQuery {
	return surrealql.Select("subject_schedule").Field("*").
		Where("subject_section = $parent.id").
		OrderBy("day_of_week").
		OrderBy("starting_hour").
		OrderBy("starting_minute")
}
func GetSectionSubquery(isPrincipal bool) *surrealql.SelectQuery {
	sectionField := "principal_sections"
	if !isPrincipal {
		sectionField = "secondary_sections"
	}

	return surrealql.Select(fmt.Sprintf("$parent.%s", sectionField)).
		Field("*").
		Alias("subject", "subject_offer.in").
		Alias("subject_schedule", getScheduleSubquery()).
		Fetch("subject")
}
