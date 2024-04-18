package storage

import (
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
)

func GetCareers() ([]models.CareerNode, error) {
	rows, err := db.SurrealDB.Query("SELECT * FROM career", nil)

	if err != nil {
		return []models.CareerNode{}, fmt.Errorf("error getting careers: %v", err)
	}

	careers, err := surrealdb.SmartUnmarshal[[]models.CareerNode](rows, err)

	if err != nil {
		return []models.CareerNode{}, fmt.Errorf("error unmarshalling careers: %v", err)
	}

	return careers, nil
}

func GetCareerById(careerId string) {}
