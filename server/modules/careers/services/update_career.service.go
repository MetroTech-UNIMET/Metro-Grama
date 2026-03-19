package services

import (
	"context"
	"metrograma/db"
	dto "metrograma/modules/careers/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
)

// FIXME - Testear update en equimica y ver por que falla
// "The query was not executed due to a failed transaction\nDatabase index `unique_relationships` already contains [subject:BPTEN13, career:quimica], with record `belong:11a1cv2uus3n3cr3we1n`\nThe query was not executed due to a failed transaction\nThe query was not executed due to a failed transaction"

func UpdateCareer(ctx context.Context, newCareer dto.CareerWithSubjects, updateForm dto.CareerUpdateForm) error {
	type NewSubjectWrapper struct {
		*dto.UpdateCareerSubject
		Trimester int `json:"trimester"`
	}

	// Prepare update matrix with wrappers
	updateMatrix := make(map[int]map[int]NewSubjectWrapper)
	for tIdx, trimester := range updateForm.Subjects {
		if _, ok := updateMatrix[tIdx]; !ok {
			updateMatrix[tIdx] = make(map[int]NewSubjectWrapper)
		}
		for sIdx, subject := range trimester {
			if subject != nil {
				updateMatrix[tIdx][sIdx] = NewSubjectWrapper{
					UpdateCareerSubject: subject,
					Trimester:           tIdx + 1, // Assuming 0-based index in map, DB uses 1-based
				}
			}
		}
	}

	diff := tools.CalculateMatrixReplacementDiff(
		newCareer.Subjects,
		updateMatrix,
		func(item *dto.CareerSubjectWithoutType) string { return item.Code.String() },
		func(item NewSubjectWrapper) string { return item.Code },
		func(item *dto.CareerSubjectWithoutType) bool { return item == nil },
	)

	careerID := newCareer.ID

	updateCareerQb := surrealql.Update("$careerID")

	if updateForm.Name != "" {
		updateCareerQb = updateCareerQb.
			Set("name", updateForm.Name)
	}
	if updateForm.Emoji != "" {
		updateCareerQb = updateCareerQb.
			Set("emoji", updateForm.Emoji)
	}

	qb := surrealql.Begin().
		Do(updateCareerQb).
		Do(surrealql.For("subject", "?", diff.ToRemove).
			Let("subjectID", surrealql.Expr("$subject.code")).
			Do(surrealql.Delete("belong").
				Where("in = $subjectID AND out = $careerID")),
		).
		Do(surrealql.For("index", "0..array::len($subjectsToAdd)").
			Let("subject", surrealql.Expr("array::at($subjectsToAdd, $index)")).
			Let("subjectID", surrealql.Expr("<record<subject>>$subject.code")).
			Do(surrealql.UpsertOnly("$subjectID").
				Set("name = $subject.name").
				Set("credits = $subject.credits").
				Set("BPCredits = $subject.BPCredits")).
			Do(surrealql.RelateOnly("$subjectID", "belong", "$careerID").
				Set("trimester = $subject.trimester")).
			Do(surrealql.For("prelation", "$subject.prelations").
				Let("existsPrecede", surrealql.Select("precede").Field("id").Where("in = $prelation AND out = $subjectID")).
				If("count($existsPrecede) = 0").
				Then(func(tb *surrealql.ThenBuilder) {
					tb.Do(surrealql.RelateOnly("$prelation", "precede", "$subjectID"))
				}).
				End(),
			),
		).
		Do(surrealql.For("subject", "?", diff.Existing).
			Let("subjectID", surrealql.Expr("<record<subject>>$subject.code")).
			Do(surrealql.Update("$subjectID").
				Set("name = $subject.name ?? name").
				Set("credits = $subject.credits ?? credits").
				Set("BPCredits = $subject.BPCredits ?? BPCredits")).
			Do(surrealql.Delete("precede").
				Where("out = $subjectID")).
			Do(surrealql.Relate("($subject.prelations)", "precede", "$subjectID")),
		)

	// 	// Update belong relation (trimester)
	// 	qb.Do(surrealql.Update("belong").
	// 		Set("trimester", subject.Trimester).
	// 		Where("in = $subjectID AND out = $careerID"))
	// }

	sql, params := qb.Build()

	params["careerID"] = careerID
	params["subjectsToAdd"] = diff.ToAdd

	_, err := surrealdb.Query[any](ctx, db.SurrealDB, sql, params)
	if err != nil {
		return err
	}

	return nil
}
