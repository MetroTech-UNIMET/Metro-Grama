package services

import (
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
)

const getAllTrimestersQuery = "SELECT * FROM trimesters;"

func GetAllTrimesters() ([]models.TrimesterEntity, error) {
	result, err := surrealdb.Query[[]models.TrimesterEntity](db.SurrealDB, getAllTrimestersQuery, nil)
	if err != nil {
		return []models.TrimesterEntity{}, err
	}
	trimesters := (*result)[0].Result

	if len(trimesters) == 0 {
		return []models.TrimesterEntity{}, fmt.Errorf("no trimesters found")
	}

	return trimesters, nil
}
