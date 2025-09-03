package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// TODO - Cambiar los endpoints para que me retornen una lista de secciones que a su vez contienen
type SubjectSectionEntity struct {
	ID            surrealModels.RecordID `json:"id" validate:"required"  swaggertype:"object"`
	ClassRoomCode *string                `json:"class_room_code"`
	SectionNumber int                    `json:"section_number"`

	SubjectOffer surrealModels.RecordID `json:"subject_offer" swaggertype:"object"`
}
