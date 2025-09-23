package models

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type CareerEntity struct {
	ID                  surrealModels.RecordID `json:"id" validate:"required" swaggertype:"object"`
	Name                string                 `json:"name" validate:"required"`
	Emoji               string                 `json:"emoji" validate:"required"`
	ElectivesTrimesters []int                  `json:"electivesTrimesters"`
}

type CareerCreateForm struct {
	Id       string                   `json:"id" validate:"required"`
	Name     string                   `json:"name" validate:"required"`
	Emoji    string                   `json:"emoji" validate:"required"`
	Subjects [][]*CreateCareerSubject `json:"subjects" validate:"required,dive,required"`
}

type CreateCareerSubject struct {
	Code        string                   `json:"code" validate:"required"`
	Name        string                   `json:"name" validate:"required"`
	Credits     uint8                    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits   uint8                    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations  []surrealModels.RecordID `json:"prelations" validate:"required,dive,required" swaggertype:"array,object"`
	SubjectType string                   `json:"subjectType" validate:"required,oneof=elective existing new"`
}

type CareerUpdateForm struct {
	Name     string                               `json:"name,omitempty"`
	Emoji    string                               `json:"emoji,omitempty"`
	Subjects map[int]map[int]*UpdateCareerSubject `json:"subjects,omitempty"`
}

// REVIEW - Considerar usar omitEmpty
type UpdateCareerSubject struct {
	Code        string                   `json:"code" validate:"required"`
	Name        string                   `json:"name,omitempty"`
	Credits     uint8                    `json:"credits,omitempty" validate:"gte=0,lte=150"`
	BPCredits   uint8                    `json:"BPCredits,omitempty" validate:"gte=0,lte=150"`
	Prelations  []surrealModels.RecordID `json:"prelations,omitempty" swaggertype:"array,object"`
	SubjectType string                   `json:"subjectType,omitempty" validate:"oneof=elective existing new"`
}

type CareerSubjectWithoutType struct {
	Code       surrealModels.RecordID   `json:"code" validate:"required" swaggertype:"object"`
	Name       string                   `json:"name" validate:"required"`
	Credits    uint8                    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits  uint8                    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations []surrealModels.RecordID `json:"prelations" validate:"required" swaggertype:"array,object"`
}

type CareerWithSubjects struct {
	CareerEntity
	Subjects [][]*CareerSubjectWithoutType `json:"subjects" validate:"required,dive,required"`
}

// articulos de revistas de sistemas de recomendación (NO IA)
