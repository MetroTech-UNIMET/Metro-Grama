package DTO

import "metrograma/models"

// UpdateStudentPreferencesDTO mirrors the fields allowed to be updated
// in models.StudentPreferencesEntity
type UpdateStudentPreferencesDTO struct {
	models.PreferencesVisibility
}
