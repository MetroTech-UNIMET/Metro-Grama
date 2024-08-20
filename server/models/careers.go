package models

type CareerSubject struct {
	ID        string `json:"id" validate:"required"`
	Trimester uint8  `json:"trimester" validate:"required,gte=1,lte=20"`
}

type CareerForm struct {
	ID_Name  string          `json:"idName" validate:"required"`
	Name     string          `json:"name" validate:"required"`
	Subjects []CareerSubject `json:"subjects" validate:"required,dive,required"`
}

type CareerNode struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Emoji string `json:"emoji"`
}

type CareerForm2 struct {
	ID_Name  string              `validate:"required"`
	Name     string              `json:"name" validate:"required"`
	Emoji    string              `json:"emoji" validate:"required"`
	Subjects [][]*CareerSubject2 `json:"subjects" validate:"required,dive,required"`
}

type CareerSubject2 struct {
	Code        string   `json:"code" validate:"required"`
	Name        string   `json:"name" validate:"required"`
	Credits     uint8    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits   uint8    `json:"bpCredits" validate:"gte=0,lte=150"`
	Prelations  []string `json:"prelations" validate:"required,dive,required"`
	SubjectType string   `json:"subjectType" validate:"required,oneof=elective existing new"`
}
