package services

import (
	"context"
	"metrograma/db"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func DeleteSubject(ctx context.Context, subjectID surrealModels.RecordID) error {
	_, err := surrealdb.Delete[surrealModels.RecordID](ctx, db.SurrealDB, subjectID.String())
	return err
}
