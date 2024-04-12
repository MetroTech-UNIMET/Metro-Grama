package models

// type SubjectForm struct {
// 	SubjectName   string   `form:"subjectName"`
// 	SubjectCode   string   `form:"subjectCode"`
// 	Trimesters    []uint8  `form:"trimesters"`
// 	Careers       []string `form:"careers"`
// 	PrecedesCodes []string `form:"precedesCodes"`
// }

type SubjectForm struct {
	Name    string `json:"name"`
	Code    string `json:"code"`
	Carrers []struct {
		Trimester uint8  `json:"trimester"`
		CarrerID  string `json:"carrerID"`
	} `json:"carrers"`
	PrecedesID []string `json:"precedesID"`
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
