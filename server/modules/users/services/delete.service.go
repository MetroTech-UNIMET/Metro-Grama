package services

import (
	"context"
	"metrograma/db"
	authDTO "metrograma/modules/auth/DTO"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
)

func DeleteUserByEmail(email string) error {
	result, err := surrealdb.Query[[]authDTO.MinimalUser](context.Background(), db.SurrealDB, "DELETE user WHERE email = $email;", map[string]any{
		"email": email,
	})
	if err != nil {
		return err
	}

	data, err := tools.SafeResult(result, 0)
	if err != nil {
		return err
	}

	return tools.GetSurrealErrorMsgs(data)
}
