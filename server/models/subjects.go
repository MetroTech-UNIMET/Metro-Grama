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
