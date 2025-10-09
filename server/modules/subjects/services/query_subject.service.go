package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func useGetSubjectsQuery(careers string) (*[]surrealdb.QueryResult[[]models.SubjectsByCareers], error) {
	// TODO - Encontrar mejor manera de filtrar un -> path condicionalmente
	qb := surrealql.Select("belong").
		Alias("subject", "in").
		Alias("careers", "array::group(out)").
		Alias("prelations", "array::group(in->precede.out$prelationsConditions)").
		GroupBy("subject").
		Fetch("subject")

	if careers == "all" || careers == "" {
		sql, vars := qb.Build()
		sql = strings.Replace(sql, "$prelationsConditions", "", 1)

		return surrealdb.Query[[]models.SubjectsByCareers](context.Background(), db.SurrealDB, sql, vars)
	} else {
		careersArray := tools.StringToIdArray(careers)

		qb = qb.Where("out IN $careersId")
		sql, vars := qb.Build()
		sql = strings.Replace(sql, "$prelationsConditions", "[WHERE ->belong.out ANYINSIDE $careersId]", 1)

		vars["careersId"] = careersArray

		return surrealdb.Query[[]models.SubjectsByCareers](context.Background(), db.SurrealDB, sql, vars)
	}
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
		return []models.SubjectNode{}, echo.NewHTTPError(http.StatusNotFound, "No hay materias para las carreras proporcionadas")
	}

	return subjects, nil
}

func GetSubjectsGraph(careers string) (models.Graph[models.SubjectNode], error) {
	result, err := useGetSubjectsQuery(careers)

	if err != nil {
		return models.Graph[models.SubjectNode]{}, err
	}

	if len((*result)[0].Result) == 0 {
		return models.Graph[models.SubjectNode]{}, echo.NewHTTPError(http.StatusNotFound, "No hay materias para las carreras proporcionadas")
	}

	subjectsByCareers := (*result)[0].Result

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
	// 	Let("enrolled", surrealql.Select("enroll").Field("VALUE out").WhereEq("in", "$studentId").Where("passed = true")).
	// 	Return(surrealql.Select("subject").Value("VALUE id").Where("fn::is_subject_enrollable(id, $studentId, $enrolled) = true"))

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
