package dto

import (
	"metrograma/models"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type CareerWithSubjects struct {
	models.CareerEntity
	Subjects [][]*CareerSubjectWithoutType `json:"subjects" validate:"required,dive,required"`
}

type CareerSubjectWithoutType struct {
	Code       surrealModels.RecordID   `json:"code" validate:"required" swaggertype:"object"`
	Name       string                   `json:"name" validate:"required"`
	Credits    uint8                    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits  uint8                    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations []surrealModels.RecordID `json:"prelations" validate:"required" swaggertype:"array,object"`
}

type CareerWithSubjectsResponse struct {
	models.CareerEntity
	Subjects []SubjectComplex `json:"subjects"`
}

type SubjectComplex struct {
	Subject    models.SubjectEntity     `json:"subject"`
	Trimester  int                      `json:"trimester"`
	Prelations []surrealModels.RecordID `json:"prelations" swaggertype:"array,object"`
}
