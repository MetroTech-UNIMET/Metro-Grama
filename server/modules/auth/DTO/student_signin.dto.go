package DTO

type SubjectPassed struct {
	ID        string `json:"id" validate:"required"`
	Trimester uint8  `json:"trimester" validate:"required,gte=1,lte=20"`
}

type StudentSigninForm struct {
	FirstName      string          `json:"firstName" validate:"required,gte=3,lte=40"`
	LastName       string          `json:"lastName" validate:"required,gte=3,lte=40"`
	Email          string          `json:"email" validate:"required,unimet_email"`
	Password       string          `json:"password" validate:"required,gte=8,lte=40"`
	CareerID       string          `json:"careerID" validate:"required"`
	SubjectsPassed []SubjectPassed `json:"subjectsPassed" validate:"required,dive"`
	PictureUrl     string          `json:"pictureUrl" validate:"required"`
}
