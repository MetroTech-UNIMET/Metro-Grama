package models

// type SubjectForm struct {
// 	SubjectName   string   `form:"subjectName"`
// 	SubjectCode   string   `form:"subjectCode"`
// 	Trimesters    []uint8  `form:"trimesters"`
// 	Careers       []string `form:"careers"`
// 	PrecedesCodes []string `form:"precedesCodes"`
// }

type SubjectCareer struct {
	Trimester uint8  `json:"trimester" validate:"required, gte=1,lte=20"`
	CareerID  string `json:"careerID" validate:"required"`
}

type SubjectForm struct {
	Name       string          `json:"name" validate:"required"`
	Code       string          `json:"code" validate:"required"`
	Careers    []SubjectCareer `json:"careers" validate:"required"`
	PrecedesID []string        `json:"precedesID" validate:"required"`
}

type SubjectNode struct {
	Code      string   `json:"code"`
	Name      string   `json:"name"`
	Careers   []string `json:"careers"`
	Credits   uint8    `json:"credits"`
	BPCredits uint8    `json:"BPCredits"`
}

type SubjectEdge struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name"`
}

type SubjectsByCareers struct {
	Careers    []string `json:"careers"`
	Prelations []string `json:"prelations"`
	Subject    struct {
		ID        string `json:"id,omitempty"`
		Name      string `json:"name"`
		Credits   uint8  `json:"credits"`
		BPCredits uint8  `json:"BPCredits"`
	}
}
