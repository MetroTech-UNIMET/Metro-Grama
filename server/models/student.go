package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type StudentEntity struct {
	ID      surrealModels.RecordID `json:"id" swaggertype:"object"`
	Id_card string                 `json:"id_card"`
	User    surrealModels.RecordID `json:"user" swaggertype:"object"`
}

type StudentWithUser struct {
	StudentEntity
	User UserEntity `json:"user"`
}
