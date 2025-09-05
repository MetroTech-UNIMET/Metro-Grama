package DTO

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type CreateCourse struct {
	Sections    []surrealModels.RecordID `json:"sections" validate:"required" swaggertype:"array,object"`
	TrimesterId surrealModels.RecordID   `json:"trimesterId" validate:"required" swaggertype:"object"`
	IsPrincipal bool                     `json:"is_principal" validate:"required"`
}
