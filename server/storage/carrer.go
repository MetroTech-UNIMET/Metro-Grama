package storage

import (
	"context"
	"metrograma/db"
	"metrograma/ent"
)

func CreateCarrer(ctx context.Context, careerName string) (*ent.Career, error) {
	career, err := db.EntClient.Career.Create().SetName(careerName).Save(ctx)
	if err != nil {
		return nil, err
	}
	return career, nil
}
