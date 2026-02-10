package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/subject_offer/DTO"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type subjectOfferForSurreal struct {
	Subject    surrealModels.RecordID   `json:"subject" swaggertype:"object"`
	Trimesters []surrealModels.RecordID `json:"trimesters" swaggertype:"array"`
}

var translateTrimesters = map[string]string{
	"T1": "1",
	"T2": "2",
	"T3": "3",
	"I":  "INTENSIVO",
}

func CreateSubjectOffer(info DTO.ReadResult) error {
	subjectOffers, err := transformPDFToSurrealObjects(info)
	if err != nil {
		return err
	}

	err = relateSubjectsToTrimesters(subjectOffers)
	return err
}

func transformPDFToSurrealObjects(info DTO.ReadResult) ([]subjectOfferForSurreal, error) {
	offers := make([]subjectOfferForSurreal, len(info.SubjectOffers))

	for i, offer := range info.SubjectOffers {
		offers[i] = subjectOfferForSurreal{
			Subject:    surrealModels.NewRecordID("subject", offer.Code),
			Trimesters: make([]surrealModels.RecordID, len(offer.Trimesters)),
		}
		for j, trimester := range offer.Trimesters {
			translatedTrimester, ok := translateTrimesters[trimester]
			if !ok {
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Trimestre inválido: "+trimester)
			}
			completeName := fmt.Sprintf("%s-%s", info.Period, translatedTrimester)
			offers[i].Trimesters[j] = surrealModels.NewRecordID("trimester", completeName)
		}
	}
	return offers, nil
}

func relateSubjectsToTrimesters(offers []subjectOfferForSurreal) error {
	qb := surrealql.Begin().
		Do(surrealql.For("offer", "?", offers).
			LetTyped("subjectId", "<record<subject>>", "$offer.subject").
			LetTyped("trimesterIds", "<array<record<trimester>>>", "$offer.trimesters").
			Let("existings", surrealql.
				SelectOnly("subject_offer").
				Value("out").
				Where("in = $subjectId").
				Where("out IN $trimesterIds")).
			Let("notExistings", surrealql.Expr("array::difference($trimesterIds, $existings ?? [])")).
			Do(surrealql.Relate("$subjectId", "subject_offer", "$notExistings")),
		)

	sql, params := qb.Build()

	_, err := surrealdb.Query[any](context.Background(), db.SurrealDB, sql, params)
	return err
}

func RelateSubjectToTrimester(subjectId surrealModels.RecordID, trimesterId surrealModels.RecordID) (models.SubjectOfferEntity, error) {
	qb := surrealql.RelateOnly(subjectId, "subject_offer", trimesterId)
	sql, vars := qb.Build()

	result, err := surrealdb.Query[models.SubjectOfferEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.SubjectOfferEntity{}, err
	}

	subjectOffer := (*result)[0].Result
	return subjectOffer, nil

}
