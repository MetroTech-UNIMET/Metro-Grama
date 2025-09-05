package services

import (
	"context"
	"metrograma/db"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func DeleteSubject(subjectID surrealModels.RecordID) error {
	_, err := surrealdb.Delete[surrealModels.RecordID](context.Background(), db.SurrealDB, subjectID.String())
	return err
} 