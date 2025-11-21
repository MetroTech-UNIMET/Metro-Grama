package DTO

import (
	"metrograma/models"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// baseQueryAnnualOffer holds the common fields shared by annual offer DTO variants.
type BaseQueryAnnualOffer struct {
	models.SubjectOfferEntity
	Careers          []surrealModels.RecordID `json:"careers" swaggertype:"array,object"`
	IsEnrolled       *bool                    `json:"is_enrolled,omitempty"`
	IsEnrollable     *bool                    `json:"is_enrollable,omitempty"`
	Prelations       []models.SubjectEntity   `json:"prelations"`
	DifferentFriends int                      `json:"differentFriends"`
}

type QueryAnnualOffer struct {
	BaseQueryAnnualOffer
	Sections []SectionsWithSchedules `json:"sections"`
}

// QueryAnnualOfferWithPlanning mirrors QueryAnnualOffer but its Sections slice
// uses SectionsWithSchedulesAndPlanning to include planning students.
type QueryAnnualOfferWithPlanning struct {
	BaseQueryAnnualOffer
	Sections []SectionsWithSchedulesAndPlanning `json:"sections"`
}

type SectionsWithSchedules struct {
	models.SubjectSectionEntity
	Schedules []models.SubjectScheduleEntity `json:"schedules"`

	Friends          []models.StudentWithUser `json:"friends"`
	FriendsOfAfriend []FriendOfAFriend        `json:"friends_of_a_friend"`
}

type SectionsWithSchedulesAndPlanning struct {
	SectionsWithSchedules
	StudentsPlanningToEnroll uint `json:"students_planning_to_enroll"`
}

type FriendOfAFriend struct {
	CommonFriend    models.StudentWithUser `json:"commonFriend"`
	FriendOfAfriend models.StudentWithUser `json:"friendOfAfriend"`
}
