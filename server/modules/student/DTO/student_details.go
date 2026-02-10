package DTO

import (
	"encoding/json"
	"metrograma/models"
	"metrograma/modules/interactions/course/DTO"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type StudentDetails struct {
	models.StudentWithUser
	Careers                   []models.CareerEntity       `json:"careers"`
	PassedSubjectsByTrimester []passedSubjectsByTrimester `json:"passed_subjects"`
	Friends                   []models.StudentWithUser    `json:"friends"`

	FriendshipStatus          string                   `json:"friendship_status,omitempty"`
	ReceivingFriendshipStatus string                   `json:"receiving_friendship_status,omitempty"`
	PendingFriends            []models.StudentWithUser `json:"pending_friends,omitempty"`
	FriendApplications        []models.StudentWithUser `json:"friend_applications,omitempty"`

	CurrentCourses studentCourse `json:"current_courses"`
	NextCourses    studentCourse `json:"next_courses"`

	SubjectSectionHistory []models.SubjectSectionHistoryWithSchedules `json:"subject_section_history"`
}

type studentCourse struct {
	Principal []DTO.QueryCourse `json:"principal"`
	Secondary []DTO.QueryCourse `json:"secondary"`
}

// passedSubjectEntry is a condensed view of a single passed subject.
type passedSubjectEntry struct {
	Difficulty int                  `json:"difficulty"`
	Grade      int                  `json:"grade"`
	Subject    models.SubjectEntity `json:"subject"`
	Workload   int                  `json:"workload"`
}

// passedSubjectsByTrimester groups passed subjects for a given trimester.
type passedSubjectsByTrimester struct {
	Subjects     []passedSubjectEntry   `json:"subjects"`
	Trimester    surrealModels.RecordID `json:"trimester" swaggertype:"object"`
	AverageGrade float64                `json:"average_grade"`
}

// MarshalJSON ensures that slice fields are omitted only when nil, and included as [] when empty.
func (s *StudentDetails) MarshalJSON() ([]byte, error) {
	// Base payload without the three conditional slice fields
	type base struct {
		models.StudentWithUser
		Careers                   []models.CareerEntity                       `json:"careers"`
		FriendshipStatus          string                                      `json:"friendship_status"`
		ReceivingFriendshipStatus string                                      `json:"receiving_friendship_status"`
		CurrentCourses            studentCourse                               `json:"current_courses"`
		NextCourses               studentCourse                               `json:"next_courses"`
		SubjectSectionHistory     []models.SubjectSectionHistoryWithSchedules `json:"subject_section_history"`
	}

	b := base{
		StudentWithUser:           s.StudentWithUser,
		Careers:                   s.Careers,
		FriendshipStatus:          s.FriendshipStatus,
		ReceivingFriendshipStatus: s.ReceivingFriendshipStatus,
		CurrentCourses:            s.CurrentCourses,
		NextCourses:               s.NextCourses,
		SubjectSectionHistory:     s.SubjectSectionHistory,
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

	if s.PassedSubjectsByTrimester != nil {
		m["passed_subjects"] = s.PassedSubjectsByTrimester
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
