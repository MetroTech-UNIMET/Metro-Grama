package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type StudentPreferencesEntity struct {
	ID                  surrealModels.RecordID `json:"id" swaggertype:"object"`
	PrivacyPreferences  PreferencesVisibility  `json:"privacyPreferences" validate:"required"`
	SchedulePreferences SchedulePreferences    `json:"schedulePreferences" validate:"required"`

	Student surrealModels.RecordID `json:"student" swaggertype:"object"`
}

type SchedulePreferences struct {
	DefaultOrder        string               `json:"default_order" validate:"required"`
	PreferredSchedules  []SchedulePreference `json:"preferred_schedules" validate:"required"`
	ProhibitedSchedules []SchedulePreference `json:"prohibited_schedules" validate:"required"`
}

type SchedulePreference struct {
	DayOfWeek      int `json:"day_of_week" validate:"required,min=0,max=6"`
	StartingHour   int `json:"starting_hour" validate:"min=0,max=23"`
	StartingMinute int `json:"starting_minute" validate:"min=0,max=59"`
	EndingHour     int `json:"ending_hour" validate:"min=0,max=23"`
	EndingMinute   int `json:"ending_minute" validate:"min=0,max=59"`
}

type Visibility string

const (
	VisibilityPublic         Visibility = "public"
	VisibilityFriendsFriends Visibility = "friendsFriends"
	VisibilityOnlyFriends    Visibility = "onlyFriends"
	VisibilityPrivate        Visibility = "private"
)

type PreferencesVisibility struct {
	ShowFriends  Visibility `json:"show_friends" validate:"required,oneof=public friendsFriends onlyFriends private"`
	ShowSchedule Visibility `json:"show_schedule" validate:"required,oneof=public friendsFriends onlyFriends private"`
	ShowSubjects Visibility `json:"show_subjects" validate:"required,oneof=public friendsFriends onlyFriends private"`
}
