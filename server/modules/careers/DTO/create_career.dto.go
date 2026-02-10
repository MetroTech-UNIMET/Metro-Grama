package dto

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

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
