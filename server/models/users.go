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
