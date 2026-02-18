package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/subjects/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
)

func CreateSubjectElective(subject DTO.SubjectElectiveForm) (models.SubjectEntity, error) {

	qb := surrealql.Begin().
		Let("subjectId", surrealql.Expr("type::thing('subject', ?)", subject.Code)).
		Do(
			surrealql.Create("$subjectId").Content(map[string]any{
				"name":       subject.Name,
				"isElective": true,
			}),
		).
		Do(surrealql.For("precede", "? ", subject.Prelations).
			Do(
				surrealql.Relate(surrealql.Expr("$subjectId"), "precede", surrealql.Expr("(type::thing('subject', $precede))")),
			),
		).Return("?", surrealql.SelectOnly("$subjectId").Field("*"))

	sql, params := qb.Build()

	result, err := surrealdb.Query[models.SubjectEntity](context.Background(), db.SurrealDB, sql, params)
	if err != nil {
		return models.SubjectEntity{}, fmt.Errorf("error creating subject: %v", err)
	}

	data := (*result)[0].Result
	return data, nil
}
