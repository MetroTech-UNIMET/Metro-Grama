package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectSectionEntity struct {
	ID            surrealModels.RecordID `json:"id" validate:"required"  swaggertype:"object"`
	ClassRoomCode *string                `json:"classroom_code"`
	SectionNumber int                    `json:"section_number"`

	SubjectOffer surrealModels.RecordID `json:"subject_offer" swaggertype:"object"`
}
