package services

import (
	"metrograma/db"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func DeleteSubject(subjectID surrealModels.RecordID) error {
	_, err := surrealdb.Delete[surrealModels.RecordID](db.SurrealDB, subjectID.String())
	return err
} 