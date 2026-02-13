package DTO

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectElectiveForm struct {
	Name       string                 `json:"name" validate:"required"`
	Code       surrealModels.RecordID `json:"code" validate:"required" swaggertype:"object"`
	PrecedesID []string               `json:"precedesID" validate:"required"`
}
