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

var createCareerQuery = `
BEGIN TRANSACTION;
CREATE $careerID SET name=$careerName, emoji=$emoji, electivesTrimesters=$electivesTrimesters;

{{ range $i, $subjectsByTrimester := .Subjects }}
  {{ range $j, $subject := $subjectsByTrimester }}
	{{ if not $subject }}
      {{ continue }}
    {{ end }}
    {{ if eq $subject.SubjectType "new" }}
CREATE $subjectID{{$i}}_{{$j}} SET name=$subjectName{{$i}}_{{$j}}, credits=$subjectCredits{{$i}}_{{$j}}, BPCredits=$subjectBpCredits{{$i}}_{{$j}};
    {{ end }}
RELATE $subjectID{{$i}}_{{$j}}->belong->$careerID SET trimester = $trimester{{$i}};
  {{ end }}
{{ end }}

COMMIT TRANSACTION;	
`

func CreateCareer(careerForm models.CareerCreateForm) error {
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

	data, err := db.SurrealDB.Query(query.String(), queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func processCareerForm(careerForm models.CareerCreateForm, electivesTrimesters []int, queryParams map[string]interface{}) error {
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
			go func(i, j int, careerSubject *models.CreateCareerSubject) {
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

func GetCareerWithSubjectsById(careerId string) (models.CareerWithSubjects, error) {
	type SubjectComplex struct {
		Subject    models.Subject `json:"subject"`
		Trimester  int            `json:"trimester"`
		Prelations []string       `json:"prelations"`
	}

	type CareerWithSubjectsResponse struct {
		models.Career
		Subjects []SubjectComplex `json:"subjects"`
	}

	rows, err := db.SurrealDB.Query(`
LET $subjects = SELECT 
    in as subject, 
    trimester as trimester, 
    in<-precede.in as prelations
    FROM belong
    where out == $id
	ORDER BY trimester
    FETCH subject;

SELECT *, $subjects FROM ONLY $id; 
`, map[string]interface{}{"id": careerId})

	if err != nil {
		return models.CareerWithSubjects{}, fmt.Errorf("error getting career: %v", err)
	}

	rowsArray, ok := rows.([]any)
	// return rows, nil
	if !ok {
		return models.CareerWithSubjects{}, fmt.Errorf("unexpected result format: rows is not an array")
	}

	if len(rowsArray) < 2 {
		return models.CareerWithSubjects{}, fmt.Errorf("unexpected result format: data has less than 2 elements")
	}

	resultRow := rowsArray[1].(map[string]any)["result"]
	careerWithSubjectsResponse, err := surrealdb.SmartUnmarshal[CareerWithSubjectsResponse](resultRow, err)

	if err != nil {
		return models.CareerWithSubjects{}, fmt.Errorf("error fetching career: %v", err)
	}

	careerWithSubjects := models.CareerWithSubjects{
		CareerNode: models.CareerNode{
			ID:    careerWithSubjectsResponse.ID,
			Name:  careerWithSubjectsResponse.Name,
			Emoji: careerWithSubjectsResponse.Emoji,
		},
		Subjects: [][]*models.CareerSubjectWithoutType{},
	}

	careersCurrentTrimester := make([]*models.CareerSubjectWithoutType, 0)

	for index, subjectComplex := range careerWithSubjectsResponse.Subjects {
		subject := models.CareerSubjectWithoutType{
			Name:      subjectComplex.Subject.Name,
			Code:      subjectComplex.Subject.ID,
			Credits:   subjectComplex.Subject.Credits,
			BPCredits: subjectComplex.Subject.BPCredits,
			// Trimester:  subjectComplex.Trimester,
			Prelations: subjectComplex.Prelations,
		}
		newTrimester := (index != 0 && subjectComplex.Trimester != careerWithSubjectsResponse.Subjects[index-1].Trimester) ||
			index == len(careerWithSubjectsResponse.Subjects)-1

		if newTrimester {
			for len(careersCurrentTrimester) < 5 {
				careersCurrentTrimester = append(careersCurrentTrimester, nil)
			}

			careerWithSubjects.Subjects = append(careerWithSubjects.Subjects, careersCurrentTrimester)
			careersCurrentTrimester = []*models.CareerSubjectWithoutType{&subject}
		} else {
			careersCurrentTrimester = append(careersCurrentTrimester, &subject)
		}
	}

	return careerWithSubjects, nil
}

var updateCareerQuery = `
BEGIN TRANSACTION;

UPDATE $career.ID MERGE $career;

FOR $subject in $subjectsCodesToUnrelate {
    DELETE $subject->belong WHERE out=$career.ID;
};

FOR $subject in $completeSubjectsToCreate {
	CREATE $subject.Code CONTENT $subject;
};

FOR $subject in $subjectsToRelate {
	let $from = $subject.Code;
    let $to = $career.ID;
    
    RELATE $from->belong->$to set trimester=$subject.Trimester;
};

FOR $subject in $completeSubjectsToUpdate {
    let $subjectCode = $subject.code;
	UPDATE $subject.code MERGE $subject;
    
    FOR $prelationCode in $subject.prelationsToCreate {
        RELATE $prelationCode->precede->$subjectCode;
    };

     FOR $prelationCode in $subject.prelationsToUndo {
          DELETE $prelationCode->precede WHERE out=$subjectCode;
    };
};

COMMIT TRANSACTION;
`

func UpdateCareerWithSubjects(oldCareer models.CareerWithSubjects, newCareerForm models.CareerUpdateForm) any {
	subjectsToUpdate, subjectsToRelate, subjectsToUnrelate, subjectsToCreate :=
		compareForms(oldCareer, newCareerForm)

	queryParams := map[string]any{
		"career": map[string]string{
			"ID":    oldCareer.ID,
			"Name":  newCareerForm.Name,
			"Emoji": newCareerForm.Emoji,
		},
	}

	subjectsCodesToUnrelate := []string{}
	for _, positions := range subjectsToUnrelate {
		oldCode := oldCareer.Subjects[positions[0]][positions[1]].Code

		subjectsCodesToUnrelate = append(subjectsCodesToUnrelate, oldCode)
	}
	queryParams["subjectsCodesToUnrelate"] = subjectsCodesToUnrelate

	subjectsToRelateUpdate := []any{}
	for _, positions := range subjectsToRelate {
		newCode := newCareerForm.Subjects[positions[0]][positions[1]].Code

		trimester := positions[0] + 1

		subjectsToRelateUpdate = append(subjectsToRelateUpdate, map[string]any{
			"Code":      newCode,
			"Trimester": trimester,
		})
	}
	queryParams["subjectsToRelate"] = subjectsToRelateUpdate

	completeSubjectsToCreate := []models.UpdateCareerSubject{}
	for _, positions := range subjectsToCreate {
		newSubject := *newCareerForm.Subjects[positions[0]][positions[1]]

		completeSubjectsToCreate = append(completeSubjectsToCreate, newSubject)
	}
	queryParams["completeSubjectsToCreate"] = completeSubjectsToCreate

	type ExtendedUpdateCareerSubject struct {
		models.UpdateCareerSubject
		PrelationsToUndo   []string `json:"prelationsToUndo"`
		PrelationsToCreate []string `json:"prelationsToCreate"`
	}

	completeSubjectsToUpdate := []ExtendedUpdateCareerSubject{}
	for _, positions := range subjectsToUpdate {
		newSubject := *newCareerForm.Subjects[positions[0]][positions[1]]
		oldSubject := *oldCareer.Subjects[positions[0]][positions[1]]

		prelationsToUndo := []string{}
		prelationsToCreate := []string{}

		if len(newSubject.Prelations) > 0 {
			for _, newPrelation := range newSubject.Prelations {
				completeId := tools.ToID("subject", newPrelation)
				if !tools.Contains(oldSubject.Prelations, completeId) {
					prelationsToCreate = append(prelationsToCreate, completeId)
				}
			}

			for _, oldPrelation := range oldSubject.Prelations {
				if !tools.Contains(newSubject.Prelations, tools.FromID(oldPrelation)) {
					prelationsToUndo = append(prelationsToUndo, oldPrelation)
				}
			}
		}

		newSubject.Prelations = nil
		extendedSubject := ExtendedUpdateCareerSubject{
			UpdateCareerSubject: newSubject,
			PrelationsToUndo:    prelationsToUndo,
			PrelationsToCreate:  prelationsToCreate,
		}

		completeSubjectsToUpdate = append(completeSubjectsToUpdate, extendedSubject)
	}
	queryParams["completeSubjectsToUpdate"] = completeSubjectsToUpdate

	data, err := db.SurrealDB.Query(updateCareerQuery, queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func compareForms(oldCareer models.CareerWithSubjects, newCareerForm models.CareerUpdateForm) ([][2]int, [][2]int, [][2]int, [][2]int) {
	subjectsToUpdate := [][2]int{}
	subjectsToRelate := [][2]int{}
	subjectsToUnrelate := [][2]int{}
	subjectsToCreate := [][2]int{}

	oldSubjectsPresence := make(map[string][2]int)
	newSubjectsPresence := make(map[string][2]int)

	for trimester, subjectsByTrimester := range newCareerForm.Subjects {
		for index, newSubject := range subjectsByTrimester {
			oldSubject := oldCareer.Subjects[trimester][index]

			if oldSubject != nil {
				oldSubjectsPresence[oldSubject.Code] = [2]int{trimester, index}
			}

			if newSubject != nil {
				newSubjectsPresence[newSubject.Code] = [2]int{trimester, index}
			}
		}
	}

	for oldSubjectCode, oldPositions := range oldSubjectsPresence {
		if newPositions, exists := newSubjectsPresence[oldSubjectCode]; exists {
			subjectsToUpdate = append(subjectsToUpdate, newPositions)
		} else {
			subjectsToUnrelate = append(subjectsToUnrelate, oldPositions)
		}

		delete(newSubjectsPresence, oldSubjectCode)
	}

	for _, newPositions := range newSubjectsPresence {
		subject := newCareerForm.Subjects[newPositions[0]][newPositions[1]]
		if subject.SubjectType == "new" {
			subjectsToCreate = append(subjectsToCreate, newPositions)
		}

		subjectsToRelate = append(subjectsToRelate, newPositions)
	}

	return subjectsToUpdate, subjectsToRelate, subjectsToUnrelate, subjectsToCreate
}
