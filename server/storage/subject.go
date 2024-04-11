package storage

import (
	"bytes"
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
)

func GetSubjectByCareer(ctx context.Context, career string) (models.Graph[models.SubjectNode], error) {
	subjects, err := surrealdb.SmartUnmarshal[[]models.Subject](db.SurrealDB.Query(`SELECT * FROM subjects WHERE careers ?= $career ORDER BY trimester FETCH precedesSubjects;`, map[string]interface{}{
		"career": career,
	}))

	if err != nil {
		return models.Graph[models.SubjectNode]{}, err
	} else if len(subjects) == 0 {
		return models.Graph[models.SubjectNode]{}, fmt.Errorf("carrer %s not found", career)
	}

	nodes := make([]models.Node[models.SubjectNode], len(subjects))
	edges := make([]models.Edge, 0)

	for i := 0; i < len(subjects); i++ {
		nodes[i] = models.Node[models.SubjectNode]{
			ID: subjects[i].ID,
			Data: models.SubjectNode{
				Code: subjects[i].ID,
				Name: subjects[i].Name,
			},
		}
		for _, ps := range subjects[i].PrecedesSubjects {
			edges = append(edges, models.Edge{
				From: ps.ID,
				To:   subjects[i].ID,
			})
		}

	}

	graph := models.Graph[models.SubjectNode]{
		Nodes: nodes,
		Edges: edges,
	}
	return graph, nil
}

func ExistSubject(id string) error {
	_, err := db.SurrealDB.Select(id)
	if err != nil {
		return err
	}
	return nil
}

func GetSubject(id string) (*models.Subject, error) {
	data, err := db.SurrealDB.Select(id)
	if err != nil {
		return nil, err
	}

	subject := new(models.Subject)
	err = surrealdb.Unmarshal(data, &subject)
	if err != nil {
		return nil, err
	}
	return subject, nil
}

const createQuery = `
BEGIN TRANSACTION;
CREATE $subjectID SET name=$subjectName;
{{ range $i, $p := .PrecedesCodes }}
RELATE $precedeID{{$i}}->precede->$subjectID;
{{end}}
{{ range $i, $c := .Careers }}
RELATE $subjectID->belong->$carrerID{{$i}} SET trimester = {{index $.Trimesters $i}};
{{end}}
COMMIT TRANSACTION;	
`

func CreateSubject(subject models.SubjectForm) error {
	t, err := template.New("query").Parse(createQuery)
	if err != nil {
		fmt.Println(err.Error())
	}
	var query bytes.Buffer
	t.Execute(&query, subject)

	queryParams := map[string]string{
		"subjectID":   subject.SubjectCode,
		"subjectName": subject.SubjectName,
	}

	for i, p := range subject.PrecedesCodes {
		queryParams[fmt.Sprintf("precedeID%d", i)] = p
	}

	for i, c := range subject.Careers {
		queryParams[fmt.Sprintf("carrerID%d", i)] = tools.ToID("carrer", c)
	}

	_, err = db.SurrealDB.Query(query.String(), queryParams)
	return err
}
