package services

import (
	"context"
	"metrograma/db"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func DeleteCareer(ctx context.Context, careerID string) error {
	_, err := surrealdb.Delete[surrealModels.RecordID](ctx, db.SurrealDB, careerID)
	return err
}
