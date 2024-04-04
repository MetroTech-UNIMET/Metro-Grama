package storage

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
)

func GetSubjectByCareer(ctx context.Context, career string) (models.Graph[models.SubjectNode], error) {
	return models.Graph[models.SubjectNode]{}, nil
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

func CreateSubject(ctx context.Context, subject models.SubjectInput) error {
	a, err := db.SurrealDB.Create("subjects", subject)
	fmt.Println(a, err)
	return err
}
