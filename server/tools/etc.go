package tools

import (
	"fmt"
	"strings"
)

func CreateMsg(msg string) map[string]string {
	return map[string]string{"message": msg}
}

func ToID(table string, id string) string {
	return fmt.Sprintf("%s:%s", table, id)
}

func FromID(id string) string {
	parts := strings.Split(id, ":")
	if len(parts) >= 1 {
		return parts[1]
	}
	return ""
}
