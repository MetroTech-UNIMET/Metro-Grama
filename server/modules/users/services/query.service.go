package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/users/DTO"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

var existUserByEmailQuery = "SELECT id, role FROM ONLY user WHERE email = $email"

func ExistUserByEmail(email string) (models.MinimalUser, error) {
	result, err := surrealdb.Query[models.MinimalUser](context.Background(), db.SurrealDB, existUserByEmailQuery, map[string]any{
		"email": email,
	})

	if err != nil {
		return models.MinimalUser{}, err
	}

	if len(*result) == 0 {
		return models.MinimalUser{}, fmt.Errorf("incorrect credentials")
	}
	user := (*result)[0].Result

	return user, nil
}

func ExistUser(id surrealModels.RecordID) (models.MinimalUser, error) {
	user, err := surrealdb.Select[models.MinimalUser](context.Background(), db.SurrealDB, id)

	if err != nil {
		return models.MinimalUser{}, err
	}

	return *user, nil
}

var getUserQuery = `SELECT *, (SELECT * 
        FROM ONLY student WHERE user = $userId) as student 
    FROM ONLY user WHERE id = $userId`

func GetUser(id surrealModels.RecordID) (DTO.UserProfile, error) {
	var params = map[string]any{
		"userId": id,
	}
	result, err := surrealdb.Query[DTO.UserProfile](context.Background(), db.SurrealDB, getUserQuery, params)

	if err != nil {
		return DTO.UserProfile{}, err
	}

	user := (*result)[0].Result

	return user, nil
}
