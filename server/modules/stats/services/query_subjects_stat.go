package services

import (
	"context"
	"fmt"
	"metrograma/db"
	DTO "metrograma/modules/stats/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// QuerySubjectStats returns aggregated stats per trimester for a subject.
// studentId may be nil if unauthenticated; use studentFilter to decide behavior upstream.
// careers is an optional list of career RecordIDs to filter enrolls by the subject's belonging careers.
// startingTrimester and endingTrimester are optional bounds; if nil, they are ignored.
func QuerySubjectStats(subjectId surrealModels.RecordID, studentId surrealModels.RecordID, studentFilter string, careers []surrealModels.RecordID, startingTrimester *surrealModels.RecordID, endingTrimester *surrealModels.RecordID) ([]DTO.SubjectStat, error) {
	qb := surrealql.Select("enroll").
		Alias("count", "count()").
		Alias("difficulty", "math::mean(<float>difficulty)").
		Alias("grade", "math::mean(<float>grade)").
		Alias("workload", "math::mean(<float>workload)").
		Field("trimester").
		FieldNameAs("trimester.starting_date", "date").
		WhereEq("out", subjectId).
		GroupBy("date").
		OrderBy("date")

	switch studentFilter {
	case "friends":
		qb.Where("in IN ?->friend->student", studentId)
	case "friendsFriends":
		qb.Where("in IN ?.{2+collect}->friend->student", studentId).
			Where("in != ?", studentId)
	}

	if len(careers) > 0 {
		qb = qb.Where("$this.in->study->career ANYINSIDE ?", careers)
	}

	if startingTrimester != nil {
		qb = qb.Where("trimester.starting_date >= ?.starting_date", *startingTrimester)
	}
	if endingTrimester != nil {
		qb = qb.Where("trimester.starting_date <= ?.starting_date", *endingTrimester)
	}

	sql, vars := qb.Build()
	fmt.Printf("SQL: %s\n", sql)

	results, err := surrealdb.Query[[]DTO.SubjectStat](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return nil, err
	}

	stats := (*results)[0].Result

	return stats, nil
}
