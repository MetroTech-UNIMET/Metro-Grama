package services

import (
	"context"
	"fmt"
	"log/slog"
	"metrograma/db"
	dto "metrograma/modules/careers/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func CreateCareer(ctx context.Context, careerForm dto.CareerCreateForm) (any, error) {
	electivesTrimesters := []int{}

	processErr := processCareerForm(careerForm, electivesTrimesters)
	if processErr != nil {
		return nil, processErr
	}

	careerId := surrealModels.NewRecordID("career", careerForm.Id)

	qb := surrealql.Begin().
		Do(surrealql.Create("$careerID").Content(map[string]any{
			"name":                careerForm.Name,
			"emoji":               careerForm.Emoji,
			"electivesTrimesters": electivesTrimesters,
		})).
		Do(surrealql.For("i", "0..array::len($subjects)").
			Let("subjectsByTrimester", surrealql.Expr("$subjects[$i] ?? []")).
			// Let("subjectsByTrimester", surrealql.Expr("IF $subjectsByTrimester = NONE THEN [] ELSE $subjectsByTrimester END")).
			Do(surrealql.For("j", "0..array::len($subjectsByTrimester)").
				Let("subject", surrealql.Expr("$subjectsByTrimester[$j]")).
				If("!$subject").
				Then(func(tb *surrealql.ThenBuilder) {
					tb.Raw("continue")
				}).
				End().
				Let("subjectID", surrealql.Expr("type::record('subject', $subject.code)")).
				If("$subject.subjectType = 'new'").
				Then(func(tb *surrealql.ThenBuilder) {
					// TODO - Hacerlo con Content
					tb.Do(surrealql.CreateOnly("$subjectID").
						Set("name = $subject.name").
						Set("credits = $subject.credits").
						Set("BPCredits = $subject.BPCredits"),
					)
				}).
				End().
				Do(surrealql.RelateOnly("$subjectID", "belong", "$careerID").Set("trimester = $i + 1")).
				Do(surrealql.For("prelation", "$subject.prelations").
					Let("existsPrecede", surrealql.Select("precede").Field("id").Where("in = $prelation AND out = $subjectID")).
					If("count($existsPrecede) = 0").
					Then(func(tb *surrealql.ThenBuilder) {
						tb.Do(surrealql.RelateOnly("$prelation", "precede", "$subjectID"))
					}).
					End(),
				),
			),
		)

	sql, params := qb.Build()

	params["subjects"] = careerForm.Subjects
	params["careerID"] = careerId

	data, err := surrealdb.Query[any](ctx, db.SurrealDB, sql, params)
	if err != nil {
		return nil, err
	}
	return tools.GetSurrealErrorMsgs(data), nil
}

func processCareerForm(careerForm dto.CareerCreateForm, electivesTrimesters []int) error {
	subjectPresence := make(map[string]bool)

	for i, subjectsByTrimester := range careerForm.Subjects {
		trimester := i + 1
		var trimesterSubjects []string

		for _, careerSubject := range subjectsByTrimester {
			if careerSubject == nil {
				electivesTrimesters = append(electivesTrimesters, trimester)
				continue
			}

			id := surrealModels.NewRecordID("subject", careerSubject.Code)

			err := tools.ExistRecord(id)

			switch careerSubject.SubjectType {
			case "new":
				if err == nil {
					slog.Error("subject already exists for new subject type",
						"subjectCode", careerSubject.Code,
						"trimester", trimester,
						// "requestId", c.Response().Header().Get(echo.HeaderXRequestID),
					)
					return fmt.Errorf("subject %s already exists", careerSubject.Code)
				}
			case "existing":
				if err != nil {
					slog.Error("subject does not exist for existing subject type",
						"subjectCode", careerSubject.Code,
						"trimester", trimester,
						// "requestId", c.Response().Header().Get(echo.HeaderXRequestID),
					)
					return fmt.Errorf("subject %s does not exist", careerSubject.Code)
				}
			}
			for _, subjectPrelation := range careerSubject.Prelations {
				prelationCode := fmt.Sprint(subjectPrelation.ID)
				if present, exists := subjectPresence[prelationCode]; !exists || !present {
					slog.Error("prelation subject does not exist in previous trimesters",
						"prelationCode", prelationCode,
						"subjectCode", careerSubject.Code,
						"trimester", trimester,
						// "requestId", c.Response().Header().Get(echo.HeaderXRequestID),
					)
					return fmt.Errorf("the prelation subject code '%s' for the subject '%s' does not exist", prelationCode, careerSubject.Code)
				}
			}

			trimesterSubjects = append(trimesterSubjects, careerSubject.Code)
		}

		for _, subjectID := range trimesterSubjects {
			subjectPresence[subjectID] = true
		}
	}

	return nil
}
