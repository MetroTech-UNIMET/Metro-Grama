package services

import (
	"context"
	"metrograma/db"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func DeleteCareer(careerID string) error {
	_, err := surrealdb.Delete[surrealModels.RecordID](context.Background(), db.SurrealDB, careerID)
	return err
} 