package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/modules/interactions/course/DTO"

	surrealdb "github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetSectionsWithSchedules retrieves principal or secondary sections (depending on isPrincipal) and their schedules for a student and trimester.
func GetSectionsWithSchedules(studentId surrealModels.RecordID, trimesterId string, isPrincipal bool) ([]DTO.QueryCourse, error) {
	sectionField := "principal_sections"
	if !isPrincipal {
		sectionField = "secondary_sections"
	}

	// Build dynamic query using provided pattern; returns array of section records directly
	query := fmt.Sprintf(`SELECT VALUE 
		(SELECT *, subject_offer.in as subject,
				(SELECT * FROM subject_schedule WHERE subject_section = $parent.id ORDER BY day_of_week, starting_hour, starting_minute) AS subject_schedule
				FROM $parent.%s FETCH subject)
FROM ONLY course
WHERE out = $trimesterId
	AND in  = $studentId;`, sectionField)

	params := map[string]any{
		"trimesterId": surrealModels.NewRecordID("trimester", trimesterId),
		"studentId":   studentId,
	}

	res, err := surrealdb.Query[[]DTO.QueryCourse](context.Background(), db.SurrealDB, query, params)
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
