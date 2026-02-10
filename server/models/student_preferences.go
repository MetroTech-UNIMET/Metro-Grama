package models

import (
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type StudentPreferencesEntity struct {
	ID                    surrealModels.RecordID `json:"id" swaggertype:"object"`
	PreferencesVisibility                        // embeds ShowFriends, ShowSchedule, ShowSubjects

	Student surrealModels.RecordID `json:"student" swaggertype:"object"`
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
