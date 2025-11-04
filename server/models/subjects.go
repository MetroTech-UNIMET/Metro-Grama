package models

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

// type SubjectForm struct {
// 	SubjectName   string   `form:"subjectName"`
// 	SubjectCode   string   `form:"subjectCode"`
// 	Trimesters    []uint8  `form:"trimesters"`
// 	Careers       []string `form:"careers"`
// 	PrecedesCodes []string `form:"precedesCodes"`
// }

type SubjectEntity struct {
	ID         surrealModels.RecordID `json:"id,omitempty" swaggertype:"object"`
	Name       string                 `json:"name"`
	Credits    uint8                  `json:"credits"`
	BPCredits  uint8                  `json:"BPCredits"`
	IsElective bool                   `json:"isElective"`
}

type SubjectCareer struct {
	Trimester uint8  `json:"trimester" validate:"required, gte=1,lte=20"`
	CareerID  string `json:"careerID" validate:"required"`
}

type SubjectForm struct {
	Name       string                 `json:"name" validate:"required"`
	Code       surrealModels.RecordID `json:"code" validate:"required" swaggertype:"object"`
	Careers    []SubjectCareer        `json:"careers" validate:"required"`
	PrecedesID []string               `json:"precedesID" validate:"required"`
}
