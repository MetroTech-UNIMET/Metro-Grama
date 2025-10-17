package services

import (
	"bytes"
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"sync"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

var createCareerQuery = `
BEGIN TRANSACTION;

LET $careerID = <record<career>> $career.ID;
CREATE $careerID CONTENT $career;

FOR $i IN 0..=array::len($subjects) {
    LET $subjectsByTrimester = $subjects[$i];
    FOR $j IN 0..=array::len($subjectsByTrimester) {
        LET $subject = $subjectsByTrimester[$j];
        IF $subject == NONE {
            continue;
        };

        LET $subjectID = type::thing('subject', $subject.code);

        IF $subject.subjectType = "new" {
            CREATE $subjectID CONTENT $subject;
        };
        RELATE $subjectID->belong->$careerID SET trimester = $i + 1;

        FOR $prelation in $subject.prelations {
            LET $prelationID = type::thing('subject', $prelation);

            IF (SELECT * FROM ONLY $prelationID->precede->$subjectID) {
                RELATE $prelationID->precede->$subjectID;
            };
        };
    };
};

COMMIT TRANSACTION;
`

func CreateCareer(careerForm models.CareerCreateForm) any {
	t, err := template.New("query").Parse(createCareerQuery)
	if err != nil {
		return err
	}

	var query bytes.Buffer
	err = t.Execute(&query, careerForm)
	if err != nil {
		return err
	}

	electivesTrimesters := []int{}

	processErr := processCareerForm(careerForm, electivesTrimesters)
	if processErr != nil {
		return processErr
	}
	queryParams := map[string]any{
		"career": map[string]any{
			"ID":                  surrealModels.NewRecordID("career", careerForm.Id),
			"name":                careerForm.Name,
			"emoji":               careerForm.Emoji,
			"electivesTrimesters": electivesTrimesters,
		},
		"subjects": careerForm.Subjects,
	}

	fmt.Println(queryParams)
	data, err := surrealdb.Query[any](context.Background(), db.SurrealDB, query.String(), queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func processCareerForm(careerForm models.CareerCreateForm, electivesTrimesters []int) error {
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
			go func(i, j int, careerSubject *models.CreateCareerSubject) {
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
