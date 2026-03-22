package DTO

import "metrograma/models"

// UpdateStudentPreferencesDTO mirrors the fields allowed to be updated
// in models.StudentPreferencesEntity
type UpdateStudentPreferencesDTO struct {
	PrivacyPreferences  models.PreferencesVisibility `json:"privacyPreferences" validate:"required"`
	SchedulePreferences models.SchedulePreferences   `json:"schedulePreferences" validate:"required"`
}
