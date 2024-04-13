package models

// type SubjectForm struct {
// 	SubjectName   string   `form:"subjectName"`
// 	SubjectCode   string   `form:"subjectCode"`
// 	Trimesters    []uint8  `form:"trimesters"`
// 	Careers       []string `form:"careers"`
// 	PrecedesCodes []string `form:"precedesCodes"`
// }

type CarrerForm struct {
	Trimester uint8  `json:"trimester" validate:"required, gte=1,lte=20"`
	CarrerID  string `json:"carrerID" validate:"required"`
}

type SubjectForm struct {
	Name       string       `json:"name" validate:"required"`
	Code       string       `json:"code" validate:"required"`
	Carrers    []CarrerForm `json:"carrers" validate:"required"`
	PrecedesID []string     `json:"precedesID" validate:"required"`
}

type SubjectNode struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type SubjectEdge struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name"`
}

type SubjectsEdges struct {
	SubjectEdges []struct {
		ID   string      `json:"id,omitempty"`
		From SubjectEdge `json:"in"`
		To   SubjectEdge `json:"out"`
	} `json:"edges"`

	SubjectNodes []struct {
		ID   string `json:"id,omitempty"`
		Name string `json:"name"`
	} `json:"nodes"`
}
