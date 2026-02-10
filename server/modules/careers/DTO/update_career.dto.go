package dto

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type CareerUpdateForm struct {
	Name     string                               `json:"name,omitempty"`
	Emoji    string                               `json:"emoji,omitempty"`
	Subjects map[int]map[int]*UpdateCareerSubject `json:"subjects,omitempty"`
}

type UpdateCareerSubject struct {
	Code        string                   `json:"code" validate:"required"`
	Name        string                   `json:"name,omitempty"`
	Credits     uint8                    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits   uint8                    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations  []surrealModels.RecordID `json:"prelations,omitempty" swaggertype:"array,object"`
	SubjectType string                   `json:"subjectType,omitempty" validate:"oneof=elective existing new"`
}
