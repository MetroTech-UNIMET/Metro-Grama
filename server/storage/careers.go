package storage

import (
	"bytes"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"sync"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
)

func GetCareers() ([]models.CareerNode, error) {
	rows, err := db.SurrealDB.Query("SELECT * FROM career", nil)

	if err != nil {
		return []models.CareerNode{}, fmt.Errorf("error getting careers: %v", err)
	}

	careers, err := surrealdb.SmartUnmarshal[[]models.CareerNode](rows, err)

	if err != nil {
		return []models.CareerNode{}, fmt.Errorf("error fetching careers: %v", err)
	}

	return careers, nil
}

func GetCareerById(careerId string) {}

var createCareerQuery = `
BEGIN TRANSACTION;
CREATE $careerID SET name=$careerName, emoji=$emoji, electivesTrimesters=$electivesTrimesters;

{{ range $i, $subjectsByTrimester := .Subjects }}
  {{ range $j, $subject := $subjectsByTrimester }}
	{{ if not $subject }}
      {{ continue }}
    {{ end }}
    {{ if eq $subject.SubjectType "new" }}
CREATE $subjectID{{$i}}_{{$j}} SET name=$subjectName{{$i}}_{{$j}}, credits=$subjectCredits{{$i}}_{{$j}}, bpCredits=$subjectBpCredits{{$i}}_{{$j}};
    {{ end }}
RELATE $subjectID{{$i}}_{{$j}}->belong->$careerID SET trimester = $trimester{{$i}};
  {{ end }}
{{ end }}

COMMIT TRANSACTION;	
`

func CreateCareer(careerForm models.CareerForm) error {
	t, err := template.New("query").Parse(createCareerQuery)
	if err != nil {
		return err
	}

	var query bytes.Buffer
	err = t.Execute(&query, careerForm)
	if err != nil {
		return err
	}

	queryParams := map[string]interface{}{
		"careerID":            tools.ToID("career", careerForm.ID_Name),
		"careerName":          careerForm.Name,
		"emoji":               careerForm.Emoji,
		"electivesTrimesters": []int{},
	}
	var electivesTrimesters []int

	processErr := processCareerForm(careerForm, electivesTrimesters, queryParams)
	if processErr != nil {
		return processErr
	}

	// fmt.Println(queryParams)
	// fmt.Println(query.String())
	data, err := db.SurrealDB.Query(query.String(), queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func processCareerForm(careerForm models.CareerForm, electivesTrimesters []int, queryParams map[string]interface{}) error {
	subjectPresence := make(map[string]bool)
	var wg sync.WaitGroup
	var syncQueryParams sync.Map   // Use sync.Map for concurrent access
	errChan := make(chan error, 1) // Buffered channel to handle errors

	for i, subjectsByTrimester := range careerForm.Subjects {
		trimester := i + 1
		var trimesterSubjects []string

		for j, careerSubject := range subjectsByTrimester {
			if careerSubject == nil {
				electivesTrimesters = append(electivesTrimesters, trimester)
				continue
			}

			wg.Add(1)
			go func(i, j int, careerSubject *models.CareerSubject) {
				defer wg.Done()

				id := tools.ToID("subject", careerSubject.Code)
				subjectKey := fmt.Sprintf("subjectID%d_%d", i, j)

				syncQueryParams.Store(subjectKey, id)
				syncQueryParams.Store(fmt.Sprintf("trimester%d", i), trimester)

				err := tools.ExistRecord(id)

				if careerSubject.SubjectType == "new" {
					if err == nil {
						errChan <- fmt.Errorf("subject %s already exists", careerSubject.Code)
						return
						// return fmt.Errorf("subject %s already exists", careerSubject.Code)
					}

					syncQueryParams.Store(subjectKey, id)
					syncQueryParams.Store(fmt.Sprintf("subjectName%d_%d", i, j), careerSubject.Name)
					syncQueryParams.Store(fmt.Sprintf("subjectCredits%d_%d", i, j), careerSubject.Credits)
					syncQueryParams.Store(fmt.Sprintf("subjectBpCredits%d_%d", i, j), careerSubject.BPCredits)
				} else if careerSubject.SubjectType == "existing" {
					if err != nil {
						errChan <- fmt.Errorf("subject %s does not exist", careerSubject.Code)
						return
						// return fmt.Errorf("subject %s does not exist", careerSubject.Code)
					}
				}
				for _, subjectPrelation := range careerSubject.Prelations {
					if present, exists := subjectPresence[subjectPrelation]; !exists || !present {
						errChan <- fmt.Errorf("the prelation subject code %s for the subject %s does not exist", subjectPrelation, careerSubject.Code)
						return
						// return fmt.Errorf("the prelation subject code %s for the subject %s does not exist", subjectPrelation, careerSubject.Code)
					}
				}

				trimesterSubjects = append(trimesterSubjects, careerSubject.Code)
			}(i, j, careerSubject)

		}

		wg.Wait()
		select {
		case err := <-errChan:
			return err
		default:
		}

		for _, subjectID := range trimesterSubjects {
			subjectPresence[subjectID] = true
		}
	}

	syncQueryParams.Range(func(key, value interface{}) bool {
		queryParams[key.(string)] = value
		return true
	})
	queryParams["electivesTrimesters"] = electivesTrimesters
	return nil
}

// REVIEW - Comparar si la versión paralela es más eficiente que la secuencial
// func processCareerForm(careerForm models.CareerForm2, electivesTrimesters []int, queryParams map[string]interface{}) error {
// 	subjectPresence := make(map[string]bool)

// 	for i, subjectsByTrimester := range careerForm.Subjects {
// 		trimester := i + 1
// 		var trimesterSubjects []string

// 		for j, careerSubject := range subjectsByTrimester {
// 			if careerSubject == nil {
// 				electivesTrimesters = append(electivesTrimesters, trimester)
// 				continue
// 			}

// 			id := tools.ToID("subject", careerSubject.Code)
// 			subjectKey := fmt.Sprintf("subjectID%d_%d", i, j)

// 			queryParams[subjectKey] = id
// 			queryParams[fmt.Sprintf("trimester%d", i)] = trimester

// 			err := tools.ExistRecord(id)

// 			if careerSubject.SubjectType == "new" {
// 				if err == nil {
// 					return fmt.Errorf("subject %s already exists", careerSubject.Code)
// 				}

// 				queryParams[subjectKey] = id
// 				queryParams[fmt.Sprintf("subjectName%d_%d", i, j)] = careerSubject.Name
// 				queryParams[fmt.Sprintf("subjectCredits%d_%d", i, j)] = careerSubject.Credits
// 				queryParams[fmt.Sprintf("subjectBpCredits%d_%d", i, j)] = careerSubject.BPCredits
// 			} else if careerSubject.SubjectType == "existing" {
// 				if err != nil {
// 					return fmt.Errorf("subject %s does not exist", careerSubject.Code)
// 				}
// 			}
// 			for _, subjectPrelation := range careerSubject.Prelations {
// 				if present, exists := subjectPresence[subjectPrelation]; !exists || !present {
// 					return fmt.Errorf("the prelation subject code %s for the subject %s does not exist", subjectPrelation, careerSubject.Code)
// 				}
// 			}

// 			trimesterSubjects = append(trimesterSubjects, careerSubject.Code)
// 		}

// 		for _, subjectID := range trimesterSubjects {
// 			subjectPresence[subjectID] = true
// 		}
// 	}
// 	queryParams["electivesTrimesters"] = electivesTrimesters
// 	return nil
// }

func DeleteCareer(careerID string, deleteRelatedSubjects bool) error {
	if !deleteRelatedSubjects {
		_, err := db.SurrealDB.Delete(careerID)
		return err
	}
	return nil
}
