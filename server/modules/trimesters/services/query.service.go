package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
)

const getAllTrimestersQuery = "SELECT * FROM trimester;"

func GetAllTrimesters() ([]models.TrimesterEntity, error) {
	result, err := surrealdb.Query[[]models.TrimesterEntity](context.Background(), db.SurrealDB, getAllTrimestersQuery, nil)
	if err != nil {
		return []models.TrimesterEntity{}, err
	}
	trimesters := (*result)[0].Result

	if len(trimesters) == 0 {
		return []models.TrimesterEntity{}, fmt.Errorf("no trimesters found")
	}

	return trimesters, nil
}
