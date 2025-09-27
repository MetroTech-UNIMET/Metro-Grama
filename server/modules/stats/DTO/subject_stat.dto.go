package DTO

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type SubjectStat struct {
	Count      uint                   `json:"count"`
	Difficulty uint                   `json:"difficulty"`
	Grade      uint                   `json:"grade"`
	Workload   uint                   `json:"workload"`
	Trimester  surrealModels.RecordID `json:"trimester" swaggertype:"object"`
}
