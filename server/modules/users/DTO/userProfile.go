package DTO

import "metrograma/models"

type UserProfile struct {
	models.UserEntity
	Student models.StudentEntity `json:"student"`
}
