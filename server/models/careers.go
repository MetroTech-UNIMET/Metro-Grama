package models

type Career struct {
	ElectivesTrimesters []int  `json:"electivesTrimesters"`
	Emoji               string `json:"emoji"`
	ID                  string `json:"id"`
	Name                string `json:"name"`
}

type CareerNode struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Emoji string `json:"emoji"`
}

type CareerForm struct {
	ID_Name  string             `validate:"required"`
	Name     string             `json:"name" validate:"required"`
	Emoji    string             `json:"emoji" validate:"required"`
	Subjects [][]*CareerSubject `json:"subjects" validate:"required,dive,required"`
}

type CareerSubject struct {
	Code        string   `json:"code" validate:"required"`
	Name        string   `json:"name" validate:"required"`
	Credits     uint8    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits   uint8    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations  []string `json:"prelations" validate:"required,dive,required"`
	SubjectType string   `json:"subjectType" validate:"required,oneof=elective existing new"`
}

type CareerSubjectWithoutType struct {
	Code       string   `json:"code" validate:"required"`
	Name       string   `json:"name" validate:"required"`
	Credits    uint8    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits  uint8    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations []string `json:"prelations" validate:"required,dive,required"`
}

type CareerWithSubjects struct {
	CareerNode
	Subjects [][]*CareerSubjectWithoutType `json:"subjects" validate:"required,dive,required"`
}
