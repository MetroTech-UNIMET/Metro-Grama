package DTO

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type CreateEnrolled struct {
	TrimesterId surrealModels.RecordID `json:"trimesterId" validate:"required" swaggertype:"object"`
	Grade       int                    `json:"grade" validate:"required"`
	Difficulty  int                    `json:"difficulty" validate:"required"`
	Workload    int                    `json:"workload" validate:"required"`
}

type UpdateEnrolled struct {
	CreateEnrolled
	OriginalTrimesterId surrealModels.RecordID `json:"originalTrimesterId" validate:"required" swaggertype:"object"`
}
