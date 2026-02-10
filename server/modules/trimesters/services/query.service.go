package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
)

// GetAllTrimesters retrieves trimesters, optionally excluding future ones when noFuture is true.
func GetAllTrimesters(noFuture bool) ([]models.TrimesterEntity, error) {
	// Build query using surrealql without passing external params
	qb := surrealql.Select("trimester")
	if noFuture {
		qb = qb.Where("starting_date < time::now()")
	}
	qb = qb.OrderByDesc("starting_date")

	sql, vars := qb.Build()

	result, err := surrealdb.Query[[]models.TrimesterEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return []models.TrimesterEntity{}, err
	}
	trimesters := (*result)[0].Result

	if len(trimesters) == 0 {
		return []models.TrimesterEntity{}, fmt.Errorf("no trimesters found")
	}

	return trimesters, nil
}
