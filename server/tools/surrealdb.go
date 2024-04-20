package tools

import (
	"errors"
	"metrograma/db"
	"strings"
)

func GetErrorMsgs(data interface{}) error {
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

func ExistRecord(id string) error {
	_, err := db.SurrealDB.Select(id)
	if err != nil {
		return err
	}
	return nil
}
