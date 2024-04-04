package tools

import "fmt"

func CreateMsg(msg string) map[string]string {
	return map[string]string{"error": msg}
}

func ToID(table string, id string) string {
	return fmt.Sprintf("%s:%s", table, id)
}
