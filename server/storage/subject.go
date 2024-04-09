package storage

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
)

func GetSubjectByCareer(ctx context.Context, career string) (models.Graph[models.SubjectNode], error) {
	subjects, err := surrealdb.SmartUnmarshal[[]models.Subject](db.SurrealDB.Query(`SELECT * FROM subjects WHERE careers ?= $career ORDER BY trimester FETCH precedesSubjects;`, map[string]interface{}{
		"career": career,
	}))

	if err != nil {
		return models.Graph[models.SubjectNode]{}, err
	} else if len(subjects) == 0 {
		return models.Graph[models.SubjectNode]{}, fmt.Errorf("Carrer '%s' not found", career)
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

func CreateSubject(ctx context.Context, subject models.SubjectBase) error {
	_, err := db.SurrealDB.Create("subjects", subject)
	return err
}
