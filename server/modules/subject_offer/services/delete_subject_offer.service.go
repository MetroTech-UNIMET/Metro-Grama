package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UnRelateSubjectFromTrimester(ctx context.Context, subjectId surrealModels.RecordID, trimesterId surrealModels.RecordID) (models.SubjectOfferEntity, error) {
	qb := surrealql.
		DeleteOnly("subject_offer").
		Where("in = ? AND out = ?", subjectId, trimesterId).
		Return("BEFORE")
	sql, vars := qb.Build()

	result, err := surrealdb.Query[models.SubjectOfferEntity](ctx, db.SurrealDB, sql, vars)
	if err != nil {
		return models.SubjectOfferEntity{}, err
	}

	subjectOffer, err := tools.SafeResult(result, 0)
	if err != nil {
		return models.SubjectOfferEntity{}, err
	}
	return subjectOffer, nil
}
