package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UnRelateSubjectFromTrimester(subjectId surrealModels.RecordID, trimesterId surrealModels.RecordID) (models.SubjectOfferEntity, error) {
	qb := surrealql.
		DeleteOnly("subject_offer").
		Where("in = ? AND out = ?", subjectId, trimesterId).
		Return("BEFORE")
	sql, vars := qb.Build()

	result, err := surrealdb.Query[models.SubjectOfferEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.SubjectOfferEntity{}, err
	}

	subjectOffer := (*result)[0].Result
	return subjectOffer, nil
}
