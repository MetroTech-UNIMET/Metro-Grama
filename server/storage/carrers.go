package storage

import (
	"context"
	"metrograma/db"
	"metrograma/ent"
)

func GetAllCareer(ctx context.Context) (map[string][]string, error) {
	carrersJson := make(map[string][]string)
	carrers, err := db.EntClient.Career.Query().All(ctx)
	if err != nil {
		return nil, nil
	}

	carrersJson["carrers"] = make([]string, len(carrers))

	for i, c := range carrers {
		carrersJson["carrers"][i] = c.Name
	}

	return carrersJson, nil
}

func CreateCarrer(ctx context.Context, careerName string) (*ent.Career, error) {
	career, err := db.EntClient.Career.Create().SetName(careerName).Save(ctx)
	if err != nil {
		return nil, err
	}
	return career, nil
}
