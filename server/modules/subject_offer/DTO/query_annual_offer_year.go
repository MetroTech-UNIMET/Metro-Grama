package DTO

import (
	"metrograma/models"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// QueryAnnualOfferYear represents the annual offer attribution for a subject within an academic year.
// subject: full SubjectEntity (fetched)
// period: the trimester number assigned to the subject inside the career plan
// trimesters: list of trimester record IDs in which the subject is offered during the provided academic year
type QueryAnnualOfferYear struct {
	Subject    models.SubjectEntity     `json:"subject"`
	Period     uint8                    `json:"period"`
	Trimesters []surrealModels.RecordID `json:"trimesters" swaggertype:"array,object"`
}
