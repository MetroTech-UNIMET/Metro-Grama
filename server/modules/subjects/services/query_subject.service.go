package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/subjects/DTO"
	"metrograma/modules/subjects/helpers"
	"metrograma/tools"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func useGetSubjectsQuery(careers string) (*[]surrealdb.QueryResult[[]DTO.SubjectsByCareers], error) {
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

		return surrealdb.Query[[]DTO.SubjectsByCareers](context.Background(), db.SurrealDB, sql, vars)
	} else {
		careersArray := tools.StringToIdArray(careers)

		qb = qb.Where("out IN $careersId")
		sql, vars := qb.Build()
		sql = strings.Replace(sql, "$prelationsConditions", "[WHERE ->belong.out ANYINSIDE $careersId]", 1)

		vars["careersId"] = careersArray

		return surrealdb.Query[[]DTO.SubjectsByCareers](context.Background(), db.SurrealDB, sql, vars)
	}
}

func GetSubjects(careers string) ([]DTO.SubjectNode, error) {
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

	result, err := surrealdb.Query[[]DTO.SubjectNode](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return []DTO.SubjectNode{}, err
	}

	subjects := (*result)[0].Result

	if len(subjects) == 0 {
		return []DTO.SubjectNode{}, echo.NewHTTPError(http.StatusNotFound, "No hay materias para las carreras proporcionadas")
	}

	return subjects, nil
}

func GetSubjectsGraph(careers string) (models.Graph[DTO.SubjectNode], error) {
	result, err := useGetSubjectsQuery(careers)

	if err != nil {
		return models.Graph[DTO.SubjectNode]{}, err
	}

	if len((*result)[0].Result) == 0 {
		return models.Graph[DTO.SubjectNode]{}, echo.NewHTTPError(http.StatusNotFound, "No hay materias para las carreras proporcionadas")
	}

	subjectsByCareers := (*result)[0].Result

	graph := helpers.ProcessSubjectGraph(
		subjectsByCareers,
		func(item DTO.SubjectsByCareers) models.Node[DTO.SubjectNode] {
			subject := item.Subject

			return models.Node[DTO.SubjectNode]{
				ID: subject.ID.String(),
				Data: DTO.SubjectNode{
					SubjectNodeBase: DTO.SubjectNodeBase{
						Code:      subject.ID,
						Name:      subject.Name,
						Credits:   subject.Credits,
						BPCredits: subject.BPCredits,
					},
					Careers: item.Careers,
				},
			}
		},
		func(item DTO.SubjectsByCareers) []models.Edge {
			subject := item.Subject
			edges := make([]models.Edge, 0, len(item.Prelations))
			for _, pre := range item.Prelations {
				edges = append(edges, models.Edge{From: subject.ID.String(), To: pre.String()})
			}
			return edges
		},
	)

	return graph, nil
}

func GetSubjectsElectiveGraph() (models.Graph[DTO.SubjectNodeBase], error) {
	qb := surrealql.Select("subject").
		Field("*").
		Alias("prelations", "id->precede->subject").
		WhereEq("isElective", true)

	sql, vars := qb.Build()

	res, err := surrealdb.Query[[]DTO.SubjectElective](context.Background(), db.SurrealDB, sql, vars)

	if err != nil {
		return models.Graph[DTO.SubjectNodeBase]{}, err
	}

	if len((*res)[0].Result) == 0 {
		return models.Graph[DTO.SubjectNodeBase]{}, echo.NewHTTPError(http.StatusNotFound, "No hay materias electivas")
	}

	subjectsElective := (*res)[0].Result

	fmt.Println(subjectsElective, sql)

	graph := helpers.ProcessSubjectGraph(
		subjectsElective,
		func(item DTO.SubjectElective) models.Node[DTO.SubjectNodeBase] {
			subject := item
			return models.Node[DTO.SubjectNodeBase]{
				ID: subject.ID.String(),
				Data: DTO.SubjectNodeBase{
					Code:      subject.ID,
					Name:      subject.Name,
					Credits:   subject.Credits,
					BPCredits: subject.BPCredits,
				},
			}
		},
		func(item DTO.SubjectElective) []models.Edge {
			subject := item
			edges := make([]models.Edge, 0, len(item.Prelations))
			for _, pre := range item.Prelations {
				edges = append(edges, models.Edge{From: subject.ID.String(), To: pre.String()})
			}
			return edges
		},
	)

	return graph, nil

}

// getEnrollableSubjects returns the list of subject RecordIDs that are enrollable for a given student.
// It runs a transaction in SurrealDB utilizing a helper function fn::is_subject_enrollable.
func GetEnrollableSubjects(studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	qb := surrealql.Begin().
		Let("enrolled", surrealql.Select("enroll").
			Value("out").
			WhereEq("in", "$studentId").
			Where("passed = true")).
		Return("?", surrealql.
			Select("subject").
			Value("id").
			Where("fn::is_subject_enrollable(id, $studentId, $enrolled) = true"))

	sql, params := qb.Build()

	// Using Query with expected return of []RecordID via RETURN statement.
	res, err := surrealdb.Query[[]surrealModels.RecordID](context.Background(), db.SurrealDB, sql, params)
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
