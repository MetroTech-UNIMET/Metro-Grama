package services

import (
	"context"
	"errors"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	DTO "metrograma/modules/interactions/enroll/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UpdateEnrollment(studentId surrealModels.RecordID, subjectId surrealModels.RecordID, input DTO.UpdateEnrolled) (models.EnrollEntity, error) {
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

	fmt.Println(query)

	resultUpdate, err := surrealdb.Query[models.EnrollEntity](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return models.EnrollEntity{}, err
	}

	if len(*resultUpdate) == 0 {
		return models.EnrollEntity{}, errors.New("failed to update enrollment")
	}
	enrollment := (*resultUpdate)[0].Result

	return enrollment, nil
}
