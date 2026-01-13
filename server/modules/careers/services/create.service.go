package services

import (
	"context"
	"fmt"
	"metrograma/db"
	dto "metrograma/modules/careers/DTO"
	"metrograma/tools"
	"sync"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func CreateCareer(careerForm dto.CareerCreateForm) any {
	electivesTrimesters := []int{}

	processErr := processCareerForm(careerForm, electivesTrimesters)
	if processErr != nil {
		return processErr
	}

	careerId := surrealModels.NewRecordID("career", careerForm.Id)

	qb := surrealql.Begin().
		LetTyped("careerID", "record<career>", surrealql.Expr("$content_1.ID")).
		Do(surrealql.Create("$careerID").Content(map[string]any{
			"ID":                  careerId,
			"name":                careerForm.Name,
			"emoji":               careerForm.Emoji,
			"electivesTrimesters": electivesTrimesters,
		})).
		Do(surrealql.For("i", "0..=array::len($subjects)").
			Let("subjectsByTrimester", surrealql.Expr("$subjects[$i]")).
			Let("subjectsByTrimester", surrealql.Expr("IF $subjectsByTrimester = NONE THEN [] ELSE $subjectsByTrimester END")).
			Do(surrealql.For("j", "0..=array::len($subjectsByTrimester)").
				Let("subject", surrealql.Expr("$subjectsByTrimester[$j]")).
				If("$subject == NONE").
				Then(func(tb *surrealql.ThenBuilder) {
					tb.Raw("continue")
				}).
				End().
				Let("subjectID", surrealql.Expr("type::thing('subject', $subject.code)")).
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
					Let("prelationID", surrealql.Expr("type::thing('subject', $prelation)")).
					Do(surrealql.RelateOnly("$prelationID", "precede", "$subjectID")),
				),
			),
		)

	sql, params := qb.Build()

	params["subjects"] = careerForm.Subjects

	data, err := surrealdb.Query[any](context.Background(), db.SurrealDB, sql, params)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func processCareerForm(careerForm dto.CareerCreateForm, electivesTrimesters []int) error {
	subjectPresence := make(map[string]bool)
	var wg sync.WaitGroup
	errChan := make(chan error, 1)

	for i, subjectsByTrimester := range careerForm.Subjects {
		trimester := i + 1
		var trimesterSubjects []string

		for j, careerSubject := range subjectsByTrimester {
			if careerSubject == nil {
				electivesTrimesters = append(electivesTrimesters, trimester)
				continue
			}

			wg.Add(1)
			go func(i, j int, careerSubject *dto.CreateCareerSubject) {
				defer wg.Done()

				id := surrealModels.NewRecordID("subject", careerSubject.Code)

				err := tools.ExistRecord(id)

				switch careerSubject.SubjectType {
				case "new":
					if err == nil {
						fmt.Printf("subject %s already exists \n", careerSubject.Code)
						errChan <- fmt.Errorf("subject %s already exists", careerSubject.Code)
						return
					}
				case "existing":
					if err != nil {
						fmt.Printf("subject %s does not exist \n", careerSubject.Code)
						errChan <- fmt.Errorf("subject %s does not exist", careerSubject.Code)
						return
					}
				}
				for _, subjectPrelation := range careerSubject.Prelations {
					if present, exists := subjectPresence[subjectPrelation.String()]; !exists || !present {
						fmt.Printf("the prelation subject code %s for the subject %s does not exist \n", subjectPrelation, careerSubject.Code)
						errChan <- fmt.Errorf("the prelation subject code '%s' for the subject '%s' does not exist", subjectPrelation, careerSubject.Code)
						return
					}
				}

				trimesterSubjects = append(trimesterSubjects, careerSubject.Code)
			}(i, j, careerSubject)
		}

		wg.Wait()
		select {
		case err := <-errChan:
			fmt.Println("err", err)
			return err
		default:
		}

		for _, subjectID := range trimesterSubjects {
			subjectPresence[subjectID] = true
		}
	}

	return nil
}
