package DTO

import (
	"encoding/json"
	"metrograma/models"
)

type StudentDetails struct {
	models.StudentWithUser
	Careers        []models.CareerEntity    `json:"careers"`
	PassedSubjects []models.EnrollEntity    `json:"passed_subjects"`
	Friends        []models.StudentWithUser `json:"friends"`

	FriendshipStatus          string                   `json:"friendship_status,omitempty"`
	ReceivingFriendshipStatus string                   `json:"receiving_friendship_status,omitempty"`
	PendingFriends            []models.StudentWithUser `json:"pending_friends,omitempty"`
	FriendApplications        []models.StudentWithUser `json:"friend_applications,omitempty"`
}

// MarshalJSON ensures that slice fields are omitted only when nil, and included as [] when empty.
func (s *StudentDetails) MarshalJSON() ([]byte, error) {
	// Base payload without the three conditional slice fields
	type base struct {
		models.StudentWithUser
		Careers                   []models.CareerEntity `json:"careers"`
		PassedSubjects            []models.EnrollEntity `json:"passed_subjects"`
		FriendshipStatus          string                `json:"friendship_status"`
		ReceivingFriendshipStatus string                `json:"receiving_friendship_status"`
	}

	b := base{
		StudentWithUser:           s.StudentWithUser,
		Careers:                   s.Careers,
		PassedSubjects:            s.PassedSubjects,
		FriendshipStatus:          s.FriendshipStatus,
		ReceivingFriendshipStatus: s.ReceivingFriendshipStatus,
	}

	// Marshal base, then convert to a map to conditionally add fields
	raw, err := json.Marshal(b)
	if err != nil {
		return nil, err
	}

	var m map[string]any
	if err := json.Unmarshal(raw, &m); err != nil {
		return nil, err
	}

	if s.Friends != nil {
		m["friends"] = s.Friends
	}
	if s.PendingFriends != nil {
		m["pending_friends"] = s.PendingFriends
	}
	if s.FriendApplications != nil {
		m["friend_applications"] = s.FriendApplications
	}

	return json.Marshal(m)
}

// UnmarshalJSON preserves the distinction between absent (nil) and present-but-empty slices.
func (s *StudentDetails) UnmarshalJSON(data []byte) error {
	type alias struct {
		models.StudentWithUser
		Careers                   []models.CareerEntity `json:"careers"`
		PassedSubjects            []models.EnrollEntity `json:"passed_subjects"`
		FriendshipStatus          string                `json:"friendship_status"`
		ReceivingFriendshipStatus string                `json:"receiving_friendship_status"`

		Friends            []models.StudentWithUser `json:"friends"`
		PendingFriends     []models.StudentWithUser `json:"pending_friends"`
		FriendApplications []models.StudentWithUser `json:"friend_applications"`
	}

	var a alias
	if err := json.Unmarshal(data, &a); err != nil {
		return err
	}

	s.StudentWithUser = a.StudentWithUser
	s.Careers = a.Careers
	s.PassedSubjects = a.PassedSubjects
	s.FriendshipStatus = a.FriendshipStatus
	s.ReceivingFriendshipStatus = a.ReceivingFriendshipStatus
	s.Friends = a.Friends
	s.PendingFriends = a.PendingFriends
	s.FriendApplications = a.FriendApplications
	return nil
}
