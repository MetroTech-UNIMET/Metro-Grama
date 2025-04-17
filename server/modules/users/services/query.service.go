package services

import (
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

var existUserByEmailQuery = "SELECT id, role FROM user WHERE email = $email"

func ExistUserByEmail(email string) (models.MinimalUser, error) {
	result, err := surrealdb.Query[[]models.MinimalUser](db.SurrealDB, existUserByEmailQuery, map[string]any{
		"email": email,
	})

	if err != nil {
		return models.MinimalUser{}, err
	}

	if len(*result) == 0 {
		return models.MinimalUser{}, fmt.Errorf("incorrect credentials")
	}
	user := (*result)[0].Result

	return user[0], nil
}

func ExistUser(id surrealModels.RecordID) (models.MinimalUser, error) {
	user, err := surrealdb.Select[models.MinimalUser](db.SurrealDB, id)

	if err != nil {
		return models.MinimalUser{}, err
	}

	return *user, nil
}

func GetUser(id surrealModels.RecordID) (models.UserEntity, error) {
	user, err := surrealdb.Select[models.UserEntity](db.SurrealDB, id)

	if err != nil {
		return models.UserEntity{}, err
	}

	return *user, nil
}


