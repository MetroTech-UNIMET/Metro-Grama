package DTO

import (
	"metrograma/models"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectElective struct {
	models.SubjectEntity

	Prelations []surrealModels.RecordID `json:"prelations" swaggertype:"array,object"`
}
