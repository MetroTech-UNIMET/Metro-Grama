package services

import (
	"context"
	"errors"
	"metrograma/db"
	"metrograma/models"
	DTO "metrograma/modules/interactions/enroll/DTO"
	"metrograma/tools"

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

	result, err := surrealdb.Query[models.EnrollEntity](ctx, db.SurrealDB, query, params)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	enrollment, err := tools.SafeResult(result, 0)
	if err != nil {
		return models.EnrollEntity{}, errors.New("failed to update enrollment")
	}

	return enrollment, nil
}
