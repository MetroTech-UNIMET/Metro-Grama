package tools

import (
	"errors"
	"metrograma/db"
	"strings"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/pkg/models"
)

func GetSurrealErrorMsgs(data interface{}) error {
	if msgs, ok := data.([]interface{}); ok {
		msgErr := make([]string, 0, 3)
		for _, m := range msgs {
			if msgMap, ok := m.(map[string]interface{}); ok {
				if status, ok := msgMap["status"]; ok {
					if statusStr := status; statusStr == "ERR" {
						result := msgMap["result"].(string)
						msgErr = append(msgErr, result)
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
	_, err := surrealdb.Select[any](db.SurrealDB, id)
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
		recordIDs[i] = *models.ParseRecordID(v)
	}
	return recordIDs
}
