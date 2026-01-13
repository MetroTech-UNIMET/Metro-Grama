package DTO

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

// CreateSubjectOfferRequest represents the body payload to relate a subject to a trimester.
// It expects a SurrealDB RecordID for the trimester (e.g., "trimester:2425-1").
type CreateSubjectOfferRequest struct {
	TrimesterId surrealModels.RecordID `json:"trimesterId" validate:"required" swaggertype:"object"`
}
