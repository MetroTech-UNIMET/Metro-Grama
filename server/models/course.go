package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type CourseEntity struct {
	ID                surrealModels.RecordID   `json:"id" validate:"required" swaggertype:"object"`
	In                surrealModels.RecordID   `json:"in" validate:"required" swaggertype:"object"`
	Out               surrealModels.RecordID   `json:"out" validate:"required" swaggertype:"object"`
	PrincipalSections []surrealModels.RecordID `json:"principal_sections" swaggertype:"array,object" cbor:"toarray"`
	SecondarySections []surrealModels.RecordID `json:"secondary_sections" swaggertype:"array,object" cbor:"toarray"`
}
