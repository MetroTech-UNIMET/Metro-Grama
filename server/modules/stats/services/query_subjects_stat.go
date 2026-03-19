package services

import (
	"context"
	"fmt"
	"metrograma/db"
	DTO "metrograma/modules/stats/DTO"
	"metrograma/tools"
	"reflect"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// QuerySubjectStats returns aggregated stats per trimester for a subject.
// studentId may be nil if unauthenticated; use studentFilter to decide behavior upstream.
// careers is an optional list of career RecordIDs to filter enrolls by the subject's belonging careers.
// startingTrimester and endingTrimester are optional bounds; if nil, they are ignored.
func QuerySubjectStats(ctx context.Context, subjectId surrealModels.RecordID, studentId surrealModels.RecordID, studentFilter string, careers []surrealModels.RecordID, startingTrimester *surrealModels.RecordID, endingTrimester *surrealModels.RecordID) ([]DTO.SubjectStat, error) {
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

	// FIXME - Por alguna razon de porqueria no puedo pasar []DTO.SubjectStat
	results, err := surrealdb.Query[any](ctx, db.SurrealDB, sql, vars)

	if err != nil {
		return nil, err
	}

	if results == nil || len(*results) == 0 {
		return []DTO.SubjectStat{}, nil
	}

	firstResult, err := tools.SafeResult(results, 0)
	if err != nil {
		return nil, err
	}

	rawStats, ok := unwrapRaw(firstResult).([]any)
	if !ok {
		return nil, fmt.Errorf("unexpected subject stats result type: %T", firstResult)
	}

	stats := make([]DTO.SubjectStat, 0, len(rawStats))
	for _, item := range rawStats {
		rawStat, ok := unwrapRaw(item).(map[string]any)
		if !ok {
			return nil, fmt.Errorf("unexpected subject stat item type: %T", item)
		}
		stats = append(stats, mapSubjectStat(rawStat))
	}

	return stats, nil
}

func mapSubjectStat(raw map[string]any) DTO.SubjectStat {
	stat := DTO.SubjectStat{}

	if v, ok := raw["count"]; ok {
		stat.Count = asUint(v)
	}
	if v, ok := raw["difficulty"]; ok {
		stat.Difficulty = asFloat32(v)
	}
	if v, ok := raw["grade"]; ok {
		stat.Grade = asFloat32(v)
	}
	if v, ok := raw["workload"]; ok {
		stat.Workload = asFloat32(v)
	}
	if v, ok := raw["date"]; ok {
		if date, ok := asCustomDateTime(v); ok {
			stat.Date = date
		}
	}
	if v, ok := raw["trimester"]; ok {
		if trimester, ok := asRecordID(v); ok {
			stat.Trimester = trimester
		}
	}

	return stat
}

func unwrapRaw(v any) any {
	for v != nil {
		rv := reflect.ValueOf(v)
		switch rv.Kind() {
		case reflect.Interface, reflect.Pointer:
			if rv.IsNil() {
				return nil
			}
			v = rv.Elem().Interface()
		default:
			return v
		}
	}

	return nil
}

func asUint(v any) uint {
	v = unwrapRaw(v)
	switch n := v.(type) {
	case uint:
		return n
	case uint8:
		return uint(n)
	case uint16:
		return uint(n)
	case uint32:
		return uint(n)
	case uint64:
		return uint(n)
	case int:
		if n < 0 {
			return 0
		}
		return uint(n)
	case int8:
		if n < 0 {
			return 0
		}
		return uint(n)
	case int16:
		if n < 0 {
			return 0
		}
		return uint(n)
	case int32:
		if n < 0 {
			return 0
		}
		return uint(n)
	case int64:
		if n < 0 {
			return 0
		}
		return uint(n)
	case float32:
		if n < 0 {
			return 0
		}
		return uint(n)
	case float64:
		if n < 0 {
			return 0
		}
		return uint(n)
	default:
		return 0
	}
}

func asFloat32(v any) float32 {
	v = unwrapRaw(v)
	switch n := v.(type) {
	case float32:
		return n
	case float64:
		return float32(n)
	case int:
		return float32(n)
	case int8:
		return float32(n)
	case int16:
		return float32(n)
	case int32:
		return float32(n)
	case int64:
		return float32(n)
	case uint:
		return float32(n)
	case uint8:
		return float32(n)
	case uint16:
		return float32(n)
	case uint32:
		return float32(n)
	case uint64:
		return float32(n)
	default:
		return 0
	}
}

func asCustomDateTime(v any) (surrealModels.CustomDateTime, bool) {
	v = unwrapRaw(v)
	date, ok := v.(surrealModels.CustomDateTime)
	return date, ok
}

func asRecordID(v any) (surrealModels.RecordID, bool) {
	v = unwrapRaw(v)

	if recordID, ok := v.(surrealModels.RecordID); ok {
		return recordID, true
	}

	if values, ok := v.([]any); ok {
		for _, item := range values {
			if recordID, ok := asRecordID(item); ok {
				return recordID, true
			}
		}
	}

	return surrealModels.RecordID{}, false
}
