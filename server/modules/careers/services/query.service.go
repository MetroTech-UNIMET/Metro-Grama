package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func GetCareers() ([]models.CareerEntity, error) {
	careers, err := surrealdb.Select[[]models.CareerEntity](context.Background(), db.SurrealDB, surrealModels.Table("career"))

	if err != nil {
		return []models.CareerEntity{}, fmt.Errorf("error fetching careers: %v", err)
	}

	return *careers, nil
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

	rows, err := surrealdb.Query[CareerWithSubjectsResponse](context.Background(), db.SurrealDB, `
LET $subjects = SELECT
    in as subject,
    trimester as trimester,
    in<-precede.in as prelations
    FROM belong
    where out == $id
	ORDER BY trimester
    FETCH subject;

SELECT *, $subjects FROM ONLY $id;
`, map[string]any{"id": surrealModels.NewRecordID("career", careerId)})

	if err != nil {
		return models.CareerWithSubjects{}, fmt.Errorf("error getting career: %v", err)
	}

	careerWithSubjectsResponse := (*rows)[1].Result

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