package tools

import (
	"context"
	"errors"
	"metrograma/db"
	"strings"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/pkg/models"
)

// ExtractSurrealErrorMessage returns the substring that follows the standard
// SurrealDB error marker "An error occurred:". If the marker is not found,
// the original string is returned trimmed.
func ExtractSurrealErrorMessage(s string) string {
	const marker = "An error occurred:"
	idx := strings.Index(s, marker)
	if idx < 0 {
		return strings.TrimSpace(s)
	}
	return strings.TrimSpace(s[idx+len(marker):])
}

// TODO - Borrar función
func GetSurrealErrorMsgs(data interface{}) error {
	if msgs, ok := data.([]interface{}); ok {
		msgErr := make([]string, 0, 3)
		for _, m := range msgs {
			if msgMap, ok := m.(map[string]interface{}); ok {
				if status, ok := msgMap["status"]; ok {
					if statusStr := status; statusStr == "ERR" {
						result, _ := msgMap["result"].(string)
						if result != "" {
							result = ExtractSurrealErrorMessage(result)
							msgErr = append(msgErr, result)
						}
					}
				}
			}
		}
		if len(msgErr) != 0 {
			return errors.New(strings.Join(msgErr, "\n"))
		}
	}
	return nil
}

func ExistRecord(id models.RecordID) error {
	_, err := surrealdb.Select[any](context.Background(), db.SurrealDB, id)
	if err != nil {
		return err
	}
	return nil
}

func StringToIdArray(value string) []models.RecordID {
	values := strings.Split(value, ",")

	return ToIdArray(values)
}

func ToIdArray(value []string) []models.RecordID {
	recordIDs := make([]models.RecordID, len(value))

	for i, v := range value {
		parsed, err := models.ParseRecordID(v)
		if err != nil {
			continue
		}
		recordIDs[i] = *parsed
	}
	return recordIDs
}
