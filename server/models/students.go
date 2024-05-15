package models

import "time"

type StudentLoginForm struct {
	Email    string `form:"email" json:"email" validate:"required,unimet_email"`
	Password string `form:"password" json:"password" validate:"required,gte=8,lte=40"`
}

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

type SimpleStudentSigninForm struct {
	FirstName  string `json:"firstName" validate:"required,gte=3,lte=40"`
	LastName   string `json:"lastName" validate:"required,gte=3,lte=40"`
	Email      string `json:"email" validate:"required,unimet_email"`
	Password   string `json:"password" validate:"required,gte=8,lte=40"`
	PictureUrl string `json:"pictureUrl" validate:"required"`
	Verified   bool   `json:"verified" validate:"required"`
}

type MinimalStudent struct {
	ID   string `json:"id"`
	Role string `json:"role"`
}

type StudentProfile struct {
	ID         string    `json:"id"`
	Role       string    `json:"role"`
	FirstName  string    `json:"firstName" `
	LastName   string    `json:"lastName" `
	Email      string    `json:"email" `
	CareerID   *string   `json:"careerID" `
	PictureUrl string    `json:"pictureUrl" `
	Created    time.Time `json:"created"`
	Verified   bool      `json:"verified"`
}
