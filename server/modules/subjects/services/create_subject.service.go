package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/subjects/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func CreateSubjectElective(subject DTO.SubjectElectiveForm) (models.SubjectEntity, error) {

	qb := surrealql.Begin().
		Let("subjectId", surrealql.Expr("type::record('subject', ?)", subject.Code)).
		Do(
			surrealql.Create("$subjectId").Content(map[string]any{
				"name":       subject.Name,
				"isElective": true,
			}),
		).
		Do(surrealql.For("precede", "? ", subject.Prelations).
			Do(
				surrealql.Relate(surrealql.Expr("$subjectId"), "precede", surrealql.Expr("(type::record('subject', $precede))")),
			),
		).Return("?", surrealql.SelectOnly("$subjectId").Field("*"))

	sql, params := qb.Build()

	result, err := surrealdb.Query[any](context.Background(), db.SurrealDB, sql, params)
	if err != nil {
		return models.SubjectEntity{}, fmt.Errorf("error creating subject: %v", err)
	}

	// FIXME - Por alguna razon, a no puedo pasar models.SubjectEntity al query
	rawSubjectResult, err := tools.SafeResult(result, 4)
	if err != nil {
		return models.SubjectEntity{}, fmt.Errorf("error creating subject: %w", err)
	}
	rawSubject, ok := rawSubjectResult.(map[string]any)
	if !ok {
		return models.SubjectEntity{}, fmt.Errorf("error creating subject: unexpected result type %T", rawSubjectResult)
	}

	data := models.SubjectEntity{
		ID: surrealModels.NewRecordID("subject", subject.Code),
	}

	if id, ok := rawSubject["id"].(surrealModels.RecordID); ok {
		data.ID = id
	}
	if name, ok := rawSubject["name"].(string); ok {
		data.Name = name
	}
	if credits, ok := rawSubject["credits"].(float64); ok {
		data.Credits = uint8(credits)
	}
	if bpCredits, ok := rawSubject["BPCredits"].(float64); ok {
		data.BPCredits = uint8(bpCredits)
	}
	if isElective, ok := rawSubject["isElective"].(bool); ok {
		data.IsElective = isElective
	}

	return data, nil
}
