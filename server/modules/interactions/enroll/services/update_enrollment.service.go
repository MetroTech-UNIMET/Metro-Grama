package services

import (
	"context"
	"errors"
	"metrograma/db"
	"metrograma/models"
	DTO "metrograma/modules/interactions/enroll/DTO"
	"metrograma/tools"
	"reflect"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// FIXME - Detectar cual trimestre es mas viejo que otro, una vez hecho eso, asegurarse que
// solo el trimestre mas viejo puede tener una grade >= 10, de lo contrario tirar error,
//
//	porque no se puede tener mas de un trimestre aprobado
func UpdateEnrollment(ctx context.Context, studentId surrealModels.RecordID, subjectId surrealModels.RecordID, input DTO.UpdateEnrolled) (models.EnrollEntity, error) {
	qb := surrealql.Begin().
		Let("enrollId", surrealql.SelectOnly("enroll").
			Value("id").
			Where("in == $studentId").
			Where("out == $subjectId").
			Where("trimester == $originalTrimesterId"),
		).
		Let("newEnrollId", surrealql.SelectOnly("enroll").
			Value("id").
			Where("in == $studentId").
			Where("out == $subjectId").
			Where("trimester == $trimesterId"),
		).
		// REVIEW - Borrar y crear funciona siempre y cuando el id de enroll no sea usado en otras relaciones
		Do(surrealql.Delete("$enrollId")).
		If("$newEnrollId != NONE").
		Then(
			func(tb *surrealql.ThenBuilder) {
				tb.Do(surrealql.Delete("$newEnrollId"))
			},
		).End().
		Return("?", surrealql.RelateOnly("$studentId", "enroll", "$subjectId").
			Set("trimester", input.TrimesterId).
			Set("grade", input.Grade).
			Set("difficulty", input.Difficulty).
			Set("workload", input.Workload),
		)

	query, params := qb.Build()
	params["studentId"] = studentId
	params["subjectId"] = subjectId
	params["trimesterId"] = input.TrimesterId
	params["originalTrimesterId"] = input.OriginalTrimesterId

	res, err := surrealdb.Query[any](ctx, db.SurrealDB, query, params)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	// This worked previously with tools.SafeResult(res, 0) before SurrealDB issues
	// Por alguna razon antes era -1 y ahora tiene que ser -2
	rawEnrollment, err := tools.SafeResult(res, -2)
	if err != nil {
		return models.EnrollEntity{}, errors.New("failed to update enrollment")
	}

	rawEnrollMap, ok := unwrapRaw(rawEnrollment).(map[string]any)
	if !ok {
		return models.EnrollEntity{}, errors.New("failed to parse enrollment")
	}

	enrollment := models.EnrollEntity{}

	if val, ok := rawEnrollMap["id"]; ok {
		if id, ok := val.(surrealModels.RecordID); ok {
			enrollment.ID = id
		}
	}
	if val, ok := rawEnrollMap["in"]; ok {
		if in, ok := val.(surrealModels.RecordID); ok {
			enrollment.In = in
		}
	}
	if val, ok := rawEnrollMap["out"]; ok {
		if out, ok := val.(surrealModels.RecordID); ok {
			enrollment.Out = out
		}
	}
	if val, ok := rawEnrollMap["trimester"]; ok {
		if t, ok := val.(surrealModels.RecordID); ok {
			enrollment.Trimester = t
		}
	}
	if val, ok := rawEnrollMap["grade"]; ok {
		if g, ok := val.(float64); ok {
			enrollment.Grade = asInt(g)
		}
	}
	if val, ok := rawEnrollMap["difficulty"]; ok {
		if d, ok := val.(float64); ok {
			enrollment.Difficulty = asInt(d)
		}
	}
	if val, ok := rawEnrollMap["workload"]; ok {
		if w, ok := val.(float64); ok {
			enrollment.Workload = asInt(w)
		}
	}

	return enrollment, nil
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

func asInt(v any) int {
	v = unwrapRaw(v)
	switch n := v.(type) {
	case int:
		return n
	case int8:
		return int(n)
	case int16:
		return int(n)
	case int32:
		return int(n)
	case int64:
		return int(n)
	case uint:
		return int(n)
	case uint8:
		return int(n)
	case uint16:
		return int(n)
	case uint32:
		return int(n)
	case uint64:
		return int(n)
	case float32:
		return int(n)
	case float64:
		return int(n)
	default:
		return 0
	}
}
