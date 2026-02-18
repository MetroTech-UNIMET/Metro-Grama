package models

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type SubjectEntity struct {
	ID         surrealModels.RecordID `json:"id" swaggertype:"object"`
	Name       string                 `json:"name"`
	Credits    uint8                  `json:"credits"`
	BPCredits  uint8                  `json:"BPCredits"`
	IsElective bool                   `json:"isElective"`
}

type SubjectCareer struct {
	Trimester uint8  `json:"trimester" validate:"required, gte=1,lte=20"`
	CareerID  string `json:"careerID" validate:"required"`
}
