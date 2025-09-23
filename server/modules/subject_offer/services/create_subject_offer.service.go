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

	// Subject    string   `json:"subject" swaggertype:"object"`
	// Trimesters []string `json:"trimesters" swaggertype:"array"`
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
			// Subject:    "subject:" + offer.Code,
			// Trimesters: make([]string, len(offer.Trimesters)),
		}
		for j, trimester := range offer.Trimesters {
			translatedTrimester, ok := translateTrimesters[trimester]
			if !ok {
				return nil, echo.NewHTTPError(http.StatusBadRequest, "Trimestre inválido: "+trimester)
			}
			completeName := fmt.Sprintf("%s-%s", info.Period, translatedTrimester)
			offers[i].Trimesters[j] = surrealModels.NewRecordID("trimester", completeName)
			// offers[i].Trimesters[j] = "trimester:" + completeName
		}
	}
	return offers, nil
}

const relateQuery = `
BEGIN TRANSACTION;

FOR $offer IN $subject_offers {
    LET $subjectId = <record<subject>> $offer.subject;
    LET $trimesterIds = <array<record<trimester>>> $offer.trimesters;

    LET $existings = SELECT VALUE out FROM subject_offer 
    WHERE in = $subjectId AND out IN $trimesterIds;
    
    LET $notExistings = array::difference($trimesterIds, $existings);

    RELATE $subjectId->subject_offer->$notExistings;
};

COMMIT TRANSACTION;`

func relateSubjectsToTrimesters(offers []subjectOfferForSurreal) error {
	queryParams := map[string]any{
		"subject_offers": offers,
	}
	_, err := surrealdb.Query[any](context.Background(), db.SurrealDB, relateQuery, queryParams)
	return err
}

func RelateSubjectToTrimester(subjectId surrealModels.RecordID, trimesterId surrealModels.RecordID) (models.SubjectOfferEntity, error) {
	// TODO - Add ONLY
	qb := surrealql.Relate(subjectId, "subject_offer", trimesterId)
	sql, vars := qb.Build()

	result, err := surrealdb.Query[[]models.SubjectOfferEntity](context.Background(), db.SurrealDB, sql, vars)
	if err != nil {
		return models.SubjectOfferEntity{}, err
	}

	subjectOffer := (*result)[0].Result
	return subjectOffer[0], nil

}
