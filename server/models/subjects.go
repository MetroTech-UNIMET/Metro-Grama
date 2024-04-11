package models

type SubjectForm struct {
	SubjectName   string   `form:"subjectName" json:"subjectName"`
	SubjectCode   string   `form:"subjectCode" json:"subjectCode"`
	Trimesters    []uint8  `form:"trimesters" json:"trimesters"`
	Careers       []string `form:"careers" json:"careers"`
	PrecedesCodes []string `form:"precedesCodes" json:"precedesCodes"`
}

type SubjectNode struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type Subject struct {
	ID               string        `json:"id,omitempty"`
	Name             string        `json:"name"`
	Trimester        uint8         `json:"trimester"`
	Careers          []string      `json:"careers"`
	PrecedesSubjects []SubjectBase `json:"precedesSubjects"`
}

type SubjectBase struct {
	ID               string   `json:"id,omitempty"`
	Name             string   `json:"name"`
	Trimester        uint8    `json:"trimester"`
	Careers          []string `json:"careers"`
	PrecedesSubjects []string `json:"precedesSubjects"`
}
