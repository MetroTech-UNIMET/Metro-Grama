package models

type Career struct {
	ElectivesTrimesters []int `json:"electivesTrimesters"`
	CareerNode
}

type CareerNode struct {
	ID    string `json:"id" validate:"required"`
	Name  string `json:"name" validate:"required"`
	Emoji string `json:"emoji" validate:"required"`
}

type CareerCreateForm struct {
	ID_Name  string                   `validate:"required"`
	Name     string                   `json:"name" validate:"required"`
	Emoji    string                   `json:"emoji" validate:"required"`
	Subjects [][]*CreateCareerSubject `json:"subjects" validate:"required,dive,required"`
}

type CreateCareerSubject struct {
	Code        string   `json:"code" validate:"required"`
	Name        string   `json:"name" validate:"required"`
	Credits     uint8    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits   uint8    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations  []string `json:"prelations" validate:"required,dive,required"`
	SubjectType string   `json:"subjectType" validate:"required,oneof=elective existing new"`
}

type CareerUpdateForm struct {
	Name     string                               `json:"name,omitempty"`
	Emoji    string                               `json:"emoji,omitempty"`
	Subjects map[int]map[int]*UpdateCareerSubject `json:"subjects,omitempty"`
}

// REVIEW - Considerar usar omitEmpty
type UpdateCareerSubject struct {
	Code        string   `json:"code" validate:"required"`
	Name        string   `json:"name,omitempty"`
	Credits     uint8    `json:"credits,omitempty" validate:"gte=0,lte=150"`
	BPCredits   uint8    `json:"BPCredits,omitempty" validate:"gte=0,lte=150"`
	Prelations  []string `json:"prelations,omitempty"`
	SubjectType string   `json:"subjectType,omitempty" validate:"oneof=elective existing new"`
}

type CareerSubjectWithoutType struct {
	Code       string   `json:"code" validate:"required"`
	Name       string   `json:"name" validate:"required"`
	Credits    uint8    `json:"credits" validate:"gte=0,lte=150"`
	BPCredits  uint8    `json:"BPCredits" validate:"gte=0,lte=150"`
	Prelations []string `json:"prelations" validate:"required"`
}

type CareerWithSubjects struct {
	CareerNode
	Subjects [][]*CareerSubjectWithoutType `json:"subjects" validate:"required,dive,required"`
}
