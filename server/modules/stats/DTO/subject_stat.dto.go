package DTO

import surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"

type SubjectStat struct {
	Count      uint                   `json:"count"`
	Difficulty float32                `json:"difficulty"`
	Grade      float32                `json:"grade"`
	Workload   float32                `json:"workload"`
	Trimester  surrealModels.RecordID `json:"trimester" swaggertype:"object"`
}
