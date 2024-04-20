package storage

import (
	"bytes"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
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
CREATE $careerID SET name=$careerName;
{{ range $i, $c := .Subjects }}
RELATE $subjectID{{$i}}->belong->$careerID SET trimester = $trimester{{$i}};
{{end}}
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
		"careerID":   tools.ToID("career", careerForm.ID_Name),
		"careerName": careerForm.Name,
	}

	for i, c := range careerForm.Subjects {
		queryParams[fmt.Sprintf("subjectID%d", i)] = c.ID
		queryParams[fmt.Sprintf("trimester%d", i)] = c.Trimester
	}

	data, err := db.SurrealDB.Query(query.String(), queryParams)
	if err != nil {
		return err
	}
	return tools.GetErrorMsgs(data)
}

func DeleteCareer(careerID string, deleteRelatedSubjects bool) error {
	if !deleteRelatedSubjects {
		_, err := db.SurrealDB.Delete(careerID)
		return err
	}
	return nil
}
