package models

type SubjectForm struct {
	SubjectName   string   `form:"subjectName" json:"subjectName"`
	SubjectCode   string   `form:"subjectCode" json:"subjectCode"`
	Trimester     uint8    `form:"trimester" json:"trimester"`
	Careers       []string `form:"careers" json:"careers"`
	PrecedesCodes []string `form:"precedesCodes" json:"precedesCodes"`
}

type SubjectNode struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type Subject struct {
	ID               string   `json:"id,omitempty"`
	Name             string   `json:"name"`
	Trimester        uint8    `json:"trimester"`
	Careers          []string `json:"careers"`
	PrecedesSubjects []string `json:"precedesSubjects"`
}

type SubjectInput struct {
	ID               string   `json:"id,omitempty"`
	Name             string   `json:"name"`
	Trimester        uint8    `json:"trimester"`
	Careers          []string `json:"careers"`
	PrecedesSubjects []string `json:"precedesSubjects"`
}
