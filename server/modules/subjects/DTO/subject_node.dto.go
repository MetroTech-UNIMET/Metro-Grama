package DTO

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectNodeBase struct {
	Code      surrealModels.RecordID `json:"code" swaggertype:"object"`
	Name      string                 `json:"name"`
	Credits   uint8                  `json:"credits"`
	BPCredits uint8                  `json:"BPCredits"`
}

type SubjectNode struct {
	SubjectNodeBase
	Careers []surrealModels.RecordID `json:"careers" swaggertype:"array,object"`
}
