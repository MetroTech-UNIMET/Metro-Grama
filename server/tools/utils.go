package tools

import (
	"strings"
)

func StringToArray(value string) []string {
	values := strings.Split(value, ",")
	for i, v := range values {
		values[i] = strings.TrimSpace(v)
	}
	return values

}
