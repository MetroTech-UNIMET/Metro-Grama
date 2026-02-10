package services

import (
	"context"
	"fmt"
	"metrograma/db"
	dto "metrograma/modules/careers/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
)

// TODO - Ver como hago para distinguir actualizar/crear/eliminar
// Chequear en yet las funciones que hice para comparar arrays
func UpdateCareer(newCareer dto.CareerWithSubjects, updateForm dto.CareerUpdateForm) error {
	type NewSubjectWrapper struct {
		*dto.UpdateCareerSubject
		Trimester int
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
		Do(surrealql.For("subject", "?", diff.ToAdd).
			Let("subjectID", surrealql.Expr("<record<subject>>$subject.code")).
			Do(surrealql.UpsertOnly("$subjectID").
				Set("name = $subject.name").
				Set("credits = $subject.credits").
				Set("BPCredits = $subject.BPCredits")).
			Do(surrealql.RelateOnly("$subjectID", "belong", "$careerID").
				Set("trimester = $subject.trimester")).
			Do(surrealql.Relate("($subject.prelations)", "precede", "$subjectID")),
		).
		Do(surrealql.For("subject", "?", diff.Existing).
			Let("subjectID", surrealql.Expr("<record<subject>>$subject.code")).
			Do(surrealql.Update("$subjectID").
				Set("name = $subject.name ?? name").
				Set("credits = $subject.credits ?? credits").
				Set("BPCredits = $subject.BPCredits ?? BPCredits")),
		).
		Do(surrealql.For("subject", "?", diff.ToRemove).
			Let("subjectID", surrealql.Expr("$subject.code")).
			Do(surrealql.Delete("belong").
				Where("in = $subjectID AND out = $careerID")),
		)

	// 	// Update belong relation (trimester)
	// 	qb.Do(surrealql.Update("belong").
	// 		Set("trimester", subject.Trimester).
	// 		Where("in = $subjectID AND out = $careerID"))
	// }

	sql, params := qb.Build()

	params["careerID"] = careerID
	fmt.Println(sql)

	_, err := surrealdb.Query[any](context.Background(), db.SurrealDB, sql, params)
	if err != nil {
		return err
	}

	return nil
}
