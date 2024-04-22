package models

type CareerSubject struct {
	ID        string `json:"id" validate:"required"`
	Trimester uint8  `json:"trimester" validate:"required,gte=1,lte=20"`
}

type CareerForm struct {
	ID_Name  string          `json:"idName" validate:"required"`
	Name     string          `json:"name" validate:"required"`
	Subjects []CareerSubject `json:"subjects" validate:"required,dive"`
}

type CareerNode struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Emoji string `json:"emoji"`
}
