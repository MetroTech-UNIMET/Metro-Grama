package storage

import (
	"context"
	"metrograma/db"
	"metrograma/ent"
	"metrograma/models"
)

func GetAllCareer(ctx context.Context) ([]models.Career, error) {
	carrers, err := db.EntClient.Career.Query().All(ctx)
	if err != nil {
		return nil, nil
	}

	carrersOut := make([]models.Career, len(carrers))

	for i, c := range carrers {
		carrersOut[i] = models.Career{
			ID:   c.ID.String(),
			Name: c.Name,
		}
	}

	return carrersOut, nil
}

func CreateCarrer(ctx context.Context, careerName string) (*ent.Career, error) {
	career, err := db.EntClient.Career.Create().SetName(careerName).Save(ctx)
	if err != nil {
		return nil, err
	}
	return career, nil
}
