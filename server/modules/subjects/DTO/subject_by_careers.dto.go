package DTO

import (
	"metrograma/models"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectsByCareers struct {
	Careers    []surrealModels.RecordID `json:"careers" swaggertype:"array,object"`
	Prelations []surrealModels.RecordID `json:"prelations" swaggertype:"array,object"`
	Subject    models.SubjectEntity
}
