package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"strings"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func useGetSubjectsQuery(careers string) (*[]surrealdb.QueryResult[[]models.SubjectsByCareers], error) {
	baseQuery := `
	SELECT
	in as subject,
	array::group(out) as careers,
  array::group(in->precede.out$prelationsConditions) as prelations	
  FROM belong
	$condition
	GROUP BY subject
	FETCH subject;
`

	if careers == "all" || careers == "" {
		baseQuery = strings.Replace(baseQuery, "$condition", "", 1)
		baseQuery = strings.Replace(baseQuery, "$prelationsConditions", "", 1)

		return surrealdb.Query[[]models.SubjectsByCareers](context.Background(), db.SurrealDB, baseQuery, nil)
	} else {
		careersArray := tools.StringToIdArray(careers)

		baseQuery = strings.Replace(baseQuery, "$condition", "WHERE out IN $careersId", 1)
		baseQuery = strings.Replace(baseQuery, "$prelationsConditions", "[WHERE ->belong.out ANYINSIDE $careersId]", 1)

		return surrealdb.Query[[]models.SubjectsByCareers](context.Background(), db.SurrealDB, baseQuery, map[string]any{
			"careersId": careersArray,
		})
	}
	// baseQuery := surrealql.Select(surrealModels.Table("belong")).Field("in as subject").
	// 	Field("array::group(out) as careers").
	// 	GroupBy("subject").
	// 	Fetch("subject")

	// if careers == "all" || careers == "" {
	// 	baseQuery = baseQuery.
	// 		Field("array::group(in->precede.out) as prelations")

	// 	sql, vars := baseQuery.Build()

	// 	return surrealdb.Query[[]models.SubjectsByCareers](context.Background(), db.SurrealDB, sql, vars)
	// } else {
	// 	careersArray := tools.StringToIdArray(careers)

	// 	baseQuery = baseQuery.
	// 		Field(surrealql.Expr("array::group(in->precede.out[WHERE ->belong.out ANYINSIDE ?]) as prelation", careersArray)).
	// 		Where("out in ?", careersArray)

	// 	sql, vars := baseQuery.Build()

	// 	return surrealdb.Query[[]models.SubjectsByCareers](context.Background(), db.SurrealDB, sql, vars)
	// }
}

func GetSubjects(careers string) ([]models.SubjectNode, error) {
	careersArray := []surrealModels.RecordID{}
	if careers != "none" {
		careersArray = tools.StringToIdArray(careers)
	}
	careersNotEmpty := len(careersArray) > 0

	qb := surrealql.Select(surrealModels.Table("subject")).FieldNameAs("id", "code").FieldName("name").FieldName("BPCredits").FieldName("credits").
		Field("->belong->career as careers")

	if careersNotEmpty {
		qb = qb.Where("array::intersect(->belong->career, $careers) != []")
	}

	sql, vars := qb.Build()

	result, err := surrealdb.Query[[]models.SubjectNode](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return []models.SubjectNode{}, err
	}

	subjects := (*result)[0].Result

	if len(subjects) == 0 {
		return []models.SubjectNode{}, fmt.Errorf("there is no subjects belonging to this careers")
	}

	return subjects, nil
}

func GetSubjectsGraph(careers string) (models.Graph[models.SubjectNode], error) {
	result, err := useGetSubjectsQuery(careers)

	if err != nil {
		return models.Graph[models.SubjectNode]{}, err
	}

	subjectsByCareers := (*result)[0].Result

	if len(subjectsByCareers) == 0 {
		return models.Graph[models.SubjectNode]{}, fmt.Errorf("there is no subjects belonging to this careers")
	}

	nodes := make([]models.Node[models.SubjectNode], len(subjectsByCareers))
	edges := make([]models.Edge, 0)

	for i, subjectByCareer := range subjectsByCareers {
		subject := subjectByCareer.Subject

		nodes[i] = models.Node[models.SubjectNode]{
			ID: subject.ID.String(),
			Data: models.SubjectNode{
				Code:      subject.ID,
				Name:      subject.Name,
				Careers:   subjectByCareer.Careers,
				Credits:   subject.Credits,
				BPCredits: subject.BPCredits,
			},
		}

		for _, prelation := range subjectByCareer.Prelations {
			edges = append(edges, models.Edge{
				From: subject.ID.String(),
				To:   prelation.String(),
			})
		}
	}

	return models.Graph[models.SubjectNode]{
		Nodes: nodes,
		Edges: edges,
	}, nil
}

// getEnrollableSubjects returns the list of subject RecordIDs that are enrollable for a given student.
// It runs a transaction in SurrealDB utilizing a helper function fn::is_subject_enrollable.
func GetEnrollableSubjects(studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	const q = `BEGIN TRANSACTION;
LET $enrolled = SELECT VALUE out FROM enroll 
	WHERE in = $studentId AND passed=true;
RETURN SELECT VALUE id
	FROM subject
	WHERE fn::is_subject_enrollable(id, $studentId, $enrolled) = true;
COMMIT TRANSACTION;`

	// qb := surrealql.Begin().
	// Let(surrealql.Select("enroll").Field("VALUE out").WhereEq("in", studentId).Where("grade >= 10"), "enrolled")

	params := map[string]any{
		"studentId": studentId,
	}

	// Using Query with expected return of []RecordID via RETURN statement.
	res, err := surrealdb.Query[[]surrealModels.RecordID](context.Background(), db.SurrealDB, q, params)
	if err != nil {
		return nil, err
	}
	// The RETURN result will be in the last meaningful statement's result.
	// For safety, pick the last QueryResult entry.
	if res == nil || len(*res) == 0 {
		return []surrealModels.RecordID{}, nil
	}
	qr := (*res)[len(*res)-1]
	ids := qr.Result
	if ids == nil {
		return []surrealModels.RecordID{}, nil
	}
	return ids, nil
}
