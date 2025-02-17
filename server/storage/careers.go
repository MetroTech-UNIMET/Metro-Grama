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
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// TODO IMPORTANT - En general el tema de los ID string no se ha aareglado

func GetCareers() ([]models.CareerEntity, error) {
	careers, err := surrealdb.Select[[]models.CareerEntity](db.SurrealDB, surrealModels.Table("career"))

	if err != nil {
		return []models.CareerEntity{}, fmt.Errorf("error fetching careers: %v", err)
	}

	return *careers, nil
}

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

// TODO - Testear
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
	// TODO - Encontrar el tipo adecuado
	data, err := surrealdb.Query[any](db.SurrealDB, query.String(), queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
	// return queryParams
}

func processCareerForm(careerForm models.CareerCreateForm, electivesTrimesters []int) error {
	subjectPresence := make(map[string]bool)
	var wg sync.WaitGroup
	errChan := make(chan error, 1) // Buffered channel to handle errors
	// ctx, cancel := context.WithCancel(context.Background())
	// defer cancel()

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

				// select {
				// case <-ctx.Done():
				// 	return
				// default:
				// }

				id := surrealModels.NewRecordID("subject", careerSubject.Code)

				err := tools.ExistRecord(id)
				// if i == 7 {
				// 	fmt.Println(id)
				// }

				if careerSubject.SubjectType == "new" {
					if err == nil {
						fmt.Printf("subject %s already exists \n", careerSubject.Code)
						errChan <- fmt.Errorf("subject %s already exists", careerSubject.Code)
						// cancel()
						return
					}
				} else if careerSubject.SubjectType == "existing" {
					if err != nil {
						fmt.Printf("subject %s does not exist \n", careerSubject.Code)
						errChan <- fmt.Errorf("subject %s does not exist", careerSubject.Code)
						// cancel()
						return
					}
				}
				for _, subjectPrelation := range careerSubject.Prelations {
					if present, exists := subjectPresence[subjectPrelation.String()]; !exists || !present {
						fmt.Printf("the prelation subject code %s for the subject %s does not exist \n", subjectPrelation, careerSubject.Code)
						errChan <- fmt.Errorf("the prelation subject code '%s' for the subject '%s' does not exist", subjectPrelation, careerSubject.Code)
						// cancel()
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
		fmt.Println(subjectPresence, "\n")
	}

	return nil
}

// // REVIEW - Comparar si la versión paralela es más eficiente que la secuencial
// func processCareerForm2(careerForm models.CareerCreateForm, electivesTrimesters []int) error {
// 	subjectPresence := make(map[string]bool)

// 	for i, subjectsByTrimester := range careerForm.Subjects {
// 		trimester := i + 1
// 		var trimesterSubjects []string

// 		for _, careerSubject := range subjectsByTrimester {
// 			if careerSubject == nil {
// 				electivesTrimesters = append(electivesTrimesters, trimester)
// 				continue
// 			}

// 			id := tools.ToID("subject", careerSubject.Code)

// 			err := tools.ExistRecord(id)

// 			if careerSubject.SubjectType == "new" {
// 				if err == nil {
// 					return fmt.Errorf("subject %s already exists", careerSubject.Code)
// 				}

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
// 	return nil
// }

// TODO - Testear
func DeleteCareer(careerID string) error {
	_, err := surrealdb.Delete[surrealModels.RecordID](db.SurrealDB, careerID)
	return err
}

func GetCareerWithSubjectsById(careerId string) (any, error) {
	type SubjectComplex struct {
		Subject    models.SubjectEntity     `json:"subject"`
		Trimester  int                      `json:"trimester"`
		Prelations []surrealModels.RecordID `json:"prelations"`
	}

	type CareerWithSubjectsResponse struct {
		models.CareerEntity
		Subjects []SubjectComplex `json:"subjects"`
	}

	// TODO - Utilizar un GROUP BY para evitar el calculo de abajo
	rows, err := surrealdb.Query[CareerWithSubjectsResponse](db.SurrealDB, `
LET $subjects = SELECT
    in as subject,
    trimester as trimester,
    in<-precede.in as prelations
    FROM belong
    where out == $id
	ORDER BY trimester
    FETCH subject;

SELECT *, $subjects FROM ONLY $id;
`, map[string]any{"id": surrealModels.NewRecordID("career", "sistemas")})

	if err != nil {
		return models.CareerWithSubjects{}, fmt.Errorf("error getting career: %v", err)
	}

	careerWithSubjectsResponse := (*rows)[1].Result

	// return careerWithSubjectsResponse, nil

	careerWithSubjects := models.CareerWithSubjects{
		CareerEntity: models.CareerEntity{
			ID:                  careerWithSubjectsResponse.ID,
			Name:                careerWithSubjectsResponse.Name,
			Emoji:               careerWithSubjectsResponse.Emoji,
			ElectivesTrimesters: careerWithSubjectsResponse.ElectivesTrimesters,
		},
		Subjects: [][]*models.CareerSubjectWithoutType{},
	}

	careersCurrentTrimester := make([]*models.CareerSubjectWithoutType, 0)

	for index, subjectComplex := range careerWithSubjectsResponse.Subjects {
		subject := models.CareerSubjectWithoutType{
			Name:       subjectComplex.Subject.Name,
			Code:       subjectComplex.Subject.ID.String(),
			Credits:    subjectComplex.Subject.Credits,
			BPCredits:  subjectComplex.Subject.BPCredits,
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

// var updateCareerQuery = `
// BEGIN TRANSACTION;

// UPDATE $career.ID MERGE $career;

// FOR $subject in $subjectsCodesToUnrelate {
//     DELETE $subject->belong WHERE out=$career.ID;
// };

// FOR $subject in $completeSubjectsToCreate {
// 	CREATE $subject.Code CONTENT $subject;
// };

// FOR $subject in $subjectsToRelate {
// 	let $from = $subject.Code;
//     let $to = $career.ID;

//     RELATE $from->belong->$to set trimester=$subject.Trimester;
// };

// FOR $subject in $completeSubjectsToUpdate {
//     let $subjectCode = $subject.code;
// 	UPDATE $subject.code MERGE $subject;

//     FOR $prelationCode in $subject.prelationsToCreate {
//         RELATE $prelationCode->precede->$subjectCode;
//     };

//      FOR $prelationCode in $subject.prelationsToUndo {
//           DELETE $prelationCode->precede WHERE out=$subjectCode;
//     };
// };

// COMMIT TRANSACTION;
// `

// func UpdateCareerWithSubjects(oldCareer models.CareerWithSubjects, newCareerForm models.CareerUpdateForm) any {
// 	subjectsToUpdate, subjectsToRelate, subjectsToUnrelate, subjectsToCreate :=
// 		compareForms(oldCareer, newCareerForm)

// 	queryParams := map[string]any{
// 		"career": map[string]string{
// 			"ID":    oldCareer.ID,
// 			"Name":  newCareerForm.Name,
// 			"Emoji": newCareerForm.Emoji,
// 		},
// 	}

// 	subjectsCodesToUnrelate := []string{}
// 	for _, positions := range subjectsToUnrelate {
// 		oldCode := oldCareer.Subjects[positions[0]][positions[1]].Code

// 		subjectsCodesToUnrelate = append(subjectsCodesToUnrelate, oldCode)
// 	}
// 	queryParams["subjectsCodesToUnrelate"] = subjectsCodesToUnrelate

// 	subjectsToRelateUpdate := []any{}
// 	for _, positions := range subjectsToRelate {
// 		newCode := newCareerForm.Subjects[positions[0]][positions[1]].Code

// 		trimester := positions[0] + 1

// 		subjectsToRelateUpdate = append(subjectsToRelateUpdate, map[string]any{
// 			"Code":      newCode,
// 			"Trimester": trimester,
// 		})
// 	}
// 	queryParams["subjectsToRelate"] = subjectsToRelateUpdate

// 	completeSubjectsToCreate := []models.UpdateCareerSubject{}
// 	for _, positions := range subjectsToCreate {
// 		newSubject := *newCareerForm.Subjects[positions[0]][positions[1]]

// 		completeSubjectsToCreate = append(completeSubjectsToCreate, newSubject)
// 	}
// 	queryParams["completeSubjectsToCreate"] = completeSubjectsToCreate

// 	type ExtendedUpdateCareerSubject struct {
// 		models.UpdateCareerSubject
// 		PrelationsToUndo   []string `json:"prelationsToUndo"`
// 		PrelationsToCreate []string `json:"prelationsToCreate"`
// 	}

// 	completeSubjectsToUpdate := []ExtendedUpdateCareerSubject{}
// 	for _, positions := range subjectsToUpdate {
// 		newSubject := *newCareerForm.Subjects[positions[0]][positions[1]]
// 		oldSubject := *oldCareer.Subjects[positions[0]][positions[1]]

// 		prelationsToUndo := []string{}
// 		prelationsToCreate := []string{}

// 		if len(newSubject.Prelations) > 0 {
// 			for _, newPrelation := range newSubject.Prelations {
// 				completeId := tools.ToID("subject", newPrelation)
// 				if !tools.Contains(oldSubject.Prelations, completeId) {
// 					prelationsToCreate = append(prelationsToCreate, completeId)
// 				}
// 			}

// 			for _, oldPrelation := range oldSubject.Prelations {
// 				if !tools.Contains(newSubject.Prelations, tools.FromID(oldPrelation)) {
// 					prelationsToUndo = append(prelationsToUndo, oldPrelation)
// 				}
// 			}
// 		}

// 		newSubject.Prelations = nil
// 		extendedSubject := ExtendedUpdateCareerSubject{
// 			UpdateCareerSubject: newSubject,
// 			PrelationsToUndo:    prelationsToUndo,
// 			PrelationsToCreate:  prelationsToCreate,
// 		}

// 		completeSubjectsToUpdate = append(completeSubjectsToUpdate, extendedSubject)
// 	}
// 	queryParams["completeSubjectsToUpdate"] = completeSubjectsToUpdate

// 	fmt.Println(queryParams)
// 	data, err := db.SurrealDB.Query(updateCareerQuery, queryParams)
// 	if err != nil {
// 		return err
// 	}
// 	return tools.GetSurrealErrorMsgs(data)
// }

// func compareForms(oldCareer models.CareerWithSubjects, newCareerForm models.CareerUpdateForm) ([][2]int, [][2]int, [][2]int, [][2]int) {
// 	subjectsToUpdate := [][2]int{}
// 	subjectsToRelate := [][2]int{}
// 	subjectsToUnrelate := [][2]int{}
// 	subjectsToCreate := [][2]int{}

// 	oldSubjectsPresence := make(map[string][2]int)
// 	newSubjectsPresence := make(map[string][2]int)

// 	for trimester, subjectsByTrimester := range newCareerForm.Subjects {
// 		for index, newSubject := range subjectsByTrimester {
// 			oldSubject := oldCareer.Subjects[trimester][index]

// 			if oldSubject != nil {
// 				oldSubjectsPresence[oldSubject.Code] = [2]int{trimester, index}
// 			}

// 			if newSubject != nil {
// 				newSubjectsPresence[newSubject.Code] = [2]int{trimester, index}
// 			}
// 		}
// 	}

// 	for oldSubjectCode, oldPositions := range oldSubjectsPresence {
// 		if newPositions, exists := newSubjectsPresence[oldSubjectCode]; exists {
// 			subjectsToUpdate = append(subjectsToUpdate, newPositions)
// 		} else {
// 			subjectsToUnrelate = append(subjectsToUnrelate, oldPositions)
// 		}

// 		delete(newSubjectsPresence, oldSubjectCode)
// 	}

// 	for _, newPositions := range newSubjectsPresence {
// 		subject := newCareerForm.Subjects[newPositions[0]][newPositions[1]]
// 		if subject.SubjectType == "new" {
// 			subjectsToCreate = append(subjectsToCreate, newPositions)
// 		}

// 		// REVIEW Estoy asumiendo que todo RELATE también va a ser un UPDATE
// 		subjectsToUpdate = append(subjectsToUpdate, newPositions)

// 		subjectsToRelate = append(subjectsToRelate, newPositions)
// 	}

// 	return subjectsToUpdate, subjectsToRelate, subjectsToUnrelate, subjectsToCreate
// }
