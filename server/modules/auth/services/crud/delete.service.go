package services

import (
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
)

func DeleteUserByEmail(email string) error {
	result, err := surrealdb.Query[[]models.MinimalUser](db.SurrealDB, "DELETE user WHERE email = $email;", map[string]any{
		"email": email,
	})
	if err != nil {
		return err
	}

	data := (*result)[0].Result

	return tools.GetSurrealErrorMsgs(data)
}
