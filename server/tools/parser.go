package tools

import (
	"encoding/json"
	"fmt"
	"reflect"

	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func CustomMarshal(v any) ([]byte, error) {
	transformed := transformParams(v)
	return json.Marshal(transformed)
}

func transformParams(v any) any {
	switch v := v.(type) {
	case surrealModels.RecordID:
		return fmt.Sprintf("%s:%v", v.Table, v.ID)
	case map[string]any:
		newMap := make(map[string]any)
		for k, val := range v {
			newMap[k] = transformParams(val)
		}
		return newMap
	case []any:
		newSlice := make([]any, len(v))
		for i, val := range v {
			newSlice[i] = transformParams(val)
		}
		return newSlice
	default:
		val := reflect.ValueOf(v)
		if val.Kind() == reflect.Slice {
			newSlice := make([]any, val.Len())
			for i := 0; i < val.Len(); i++ {
				newSlice[i] = transformParams(val.Index(i).Interface())
			}
			return newSlice
		}
		return v
	}
}
