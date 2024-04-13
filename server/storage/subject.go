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

const queryGraph = `SELECT array::distinct(<-belong<-subject<-precede) as edges, array::distinct(<-belong<-subject) as nodes FROM $carrerID FETCH edges, edges.in, edges.out, nodes;`

func GetSubjectByCareer(carrer string) (models.Graph[models.SubjectNode], error) {
	rows, err := db.SurrealDB.Query(queryGraph, map[string]string{
		"carrerID": tools.ToID("carrer", carrer),
	})
	if err != nil {
		return models.Graph[models.SubjectNode]{}, fmt.Errorf("carrer %s not found", carrer)
	}

	carrersEdges, err := surrealdb.SmartUnmarshal[[]models.SubjectsEdges](rows, err)

	if err != nil {
		return models.Graph[models.SubjectNode]{}, err
	} else if len(carrersEdges) == 0 {
		return models.Graph[models.SubjectNode]{}, fmt.Errorf("carrer %s not found", carrer)
	}

	nodes := make([]models.Node[models.SubjectNode], len(carrersEdges[0].SubjectNodes))
	edges := make([]models.Edge, len(carrersEdges[0].SubjectEdges))

	for i, subjectNode := range carrersEdges[0].SubjectNodes {
		nodes[i] = models.Node[models.SubjectNode]{
			ID: subjectNode.ID,
			Data: models.SubjectNode{
				Code: subjectNode.ID[len("subject:"):],
				Name: subjectNode.Name,
			},
		}
	}

	for i, subjectEdge := range carrersEdges[0].SubjectEdges {
		edges[i] = models.Edge{
			From: subjectEdge.From.ID,
			To:   subjectEdge.To.ID,
		}
	}

	graph := models.Graph[models.SubjectNode]{
		Nodes: nodes,
		Edges: edges,
	}
	return graph, nil
}

func ExistRecord(id string) error {
	_, err := db.SurrealDB.Select(id)
	if err != nil {
		return err
	}
	return nil
}

const createQuery = `
BEGIN TRANSACTION;
CREATE $subjectID SET name=$subjectName;
{{ range $i, $p := .PrecedesID }}
RELATE $precedeID{{$i}}->precede->$subjectID;
{{end}}
{{ range $i, $c := .Carrers }}
RELATE $subjectID->belong->$carrerID{{$i}} SET trimester = $trimester{{$i}};
{{end}}
COMMIT TRANSACTION;	
`

func CreateSubject(subject models.SubjectForm) error {
	t, err := template.New("query").Parse(createQuery)
	if err != nil {
		return err
	}
	var query bytes.Buffer
	err = t.Execute(&query, subject)
	if err != nil {
		return err
	}

	queryParams := map[string]interface{}{
		"subjectID":   subject.Code,
		"subjectName": subject.Name,
	}

	for i, p := range subject.PrecedesID {
		queryParams[fmt.Sprintf("precedeID%d", i)] = p
	}

	for i, c := range subject.Carrers {
		queryParams[fmt.Sprintf("carrerID%d", i)] = c.CarrerID
		queryParams[fmt.Sprintf("trimester%d", i)] = c.Trimester
	}

	_, err = db.SurrealDB.Query(query.String(), queryParams)
	return err
}

func DeleteSubject(subjectID string) error {
	_, err := db.SurrealDB.Delete(subjectID)
	return err
}
