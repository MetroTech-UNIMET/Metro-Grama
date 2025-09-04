package models

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type UserEntity struct {
	ID         surrealModels.RecordID       `json:"id" swaggertype:"object"`
	Role       surrealModels.RecordID       `json:"role" swaggertype:"object"`
	FirstName  string                       `json:"firstName"`
	LastName   string                       `json:"lastName"`
	Email      string                       `json:"email"`
	Phone      string                       `json:"phone"`
	PictureUrl string                       `json:"pictureUrl"`
	Created    surrealModels.CustomDateTime `json:"created" swaggertype:"string"`
	Verified   bool                         `json:"verified"`
}

type UserLoginForm struct {
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

type SimpleUserSigninForm struct {
	FirstName  string `json:"firstName" validate:"required,gte=3,lte=40"`
	LastName   string `json:"lastName" validate:"required,gte=3,lte=40"`
	Email      string `json:"email" validate:"required,unimet_email"`
	Password   string `json:"password" validate:"required,gte=8,lte=40"`
	PictureUrl string `json:"pictureUrl" validate:"required"`
	Verified   bool   `json:"verified" validate:"required"`
	Role       string `json:"role" validate:"required"`
}

type MinimalUser struct {
	ID   surrealModels.RecordID `json:"id" swaggertype:"object"`
	Role surrealModels.RecordID `json:"role" swaggertype:"object"`
}
