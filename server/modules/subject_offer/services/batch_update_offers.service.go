package services

import (
	"context"
	"metrograma/db"
	"metrograma/modules/subject_offer/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
)

func BatchUpdateSubjectOffers(changes []DTO.BatchSubjectOfferChange) error {
	ctx := context.Background()
	qb := surrealql.Begin().
		Do(surrealql.For("subjectChange", "?", changes).
			LetTyped("subjectId", "record<subject>", surrealql.Expr("type::thing('subject',  $subjectChange.subjectId)")).
			Do(surrealql.Relate(
				surrealql.Expr("$subjectId"),
				"subject_offer",
				surrealql.Expr("($subjectChange.add.map(|$t| type::thing('trimester', $t)))"),
			)).
			Do(surrealql.Delete(surrealql.Expr("$subjectId->subject_offer")).
				Where("out IN $subjectChange.remove.map(|$t| type::thing('trimester', $t))")),
		)

	// for _, change := range changes {
	// 	subjectRID := surrealModels.NewRecordID("subject", change.SubjectID)

	// 	// Adds
	// 	for _, trimesterIDStr := range change.Add {
	// 		trimesterRID := surrealModels.NewRecordID("trimester", trimesterIDStr)

	// 		// RELATE subject->subject_offer->trimester
	// 		qb := surrealql.RelateOnly(subjectRID, "subject_offer", trimesterRID)
	// 		sql, vars := qb.Build()
	// 		_, err := surrealdb.Query[any](ctx, db.SurrealDB, sql, vars)
	// 		if err != nil {
	// 			return err
	// 		}
	// 	}

	// 	// Removes
	// 	for _, trimesterIDStr := range change.Remove {
	// 		trimesterRID := surrealModels.NewRecordID("trimester", trimesterIDStr)

	// 		// DELETE subject_offer WHERE in = $subject AND out = $trimester
	// 		qb := surrealql.DeleteOnly("subject_offer").Where("in = ? AND out = ?", subjectRID, trimesterRID)
	// 		sql, vars := qb.Build()
	// 		_, err := surrealdb.Query[any](ctx, db.SurrealDB, sql, vars)
	// 		if err != nil {
	// 			return err
	// 		}
	// 	}
	// }
	sql, params := qb.Build()
	_, err := surrealdb.Query[any](ctx, db.SurrealDB, sql, params)

	return err

}
