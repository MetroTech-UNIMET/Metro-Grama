package services

import (
	"context"
	"metrograma/db"
	"metrograma/env"
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

func useGetSubjectsQuery(ctx context.Context, careers string) ([]DTO.SubjectsByCareers, error) {
	// TODO - Encontrar mejor manera de filtrar un -> path condicionalmente
	qb := surrealql.Select("belong").
		Alias("subject", "in").
		Alias("careers", "array::group(out)").
		Alias("prelations", "array::group(in->precede.out$prelationsConditions)").
		GroupBy("subject").
		Fetch("subject")

	var sql string
	var vars map[string]interface{}

	if careers == "all" || careers == "" {
		sql, vars = qb.Build()
		sql = strings.Replace(sql, "$prelationsConditions", "", 1)
	} else {
		careersArray := tools.StringToIdArray(careers)
		qb = qb.Where("out IN $careersId")
		sql, vars = qb.Build()
		sql = strings.Replace(sql, "$prelationsConditions", "[WHERE ->belong.out ANYINSIDE $careersId]", 1)
		vars["careersId"] = careersArray
	}

	if env.GroupNotWorking {
		result, err := surrealdb.Query[[]DTO.SubjectsByCareersPORQUERIA](ctx, db.SurrealDB, sql, vars)
		if err != nil {
			return nil, err
		}

		porqueria, err := tools.SafeResult(result, 0)
		if err != nil {
			return []DTO.SubjectsByCareers{}, nil
		}
		subjects := make([]DTO.SubjectsByCareers, len(porqueria))

		for i, item := range porqueria {
			// Flatten and deduplicate prelations
			prelationsMap := make(map[string]surrealModels.RecordID)
			for _, layer1 := range item.Prelations {
				for _, layer2 := range layer1 {
					for _, rec := range layer2 {
						prelationsMap[rec.String()] = rec
					}
				}
			}

			prelations := make([]surrealModels.RecordID, 0, len(prelationsMap))
			for _, rec := range prelationsMap {
				prelations = append(prelations, rec)
			}

			subjects[i] = DTO.SubjectsByCareers{
				Careers:    item.Careers,
				Prelations: prelations,
				Subject:    item.Subject,
			}
		}

		return subjects, nil
	} else {
		result, err := surrealdb.Query[[]DTO.SubjectsByCareers](ctx, db.SurrealDB, sql, vars)
		if err != nil {
			return nil, err
		}
		subjects, err := tools.SafeResult(result, 0)
		if err != nil {
			return []DTO.SubjectsByCareers{}, nil
		}

		return subjects, nil
	}
}

func GetSubjects(ctx context.Context, careers string) ([]DTO.SubjectNode, error) {
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
	vars["careers"] = careersArray

	result, err := surrealdb.Query[[]DTO.SubjectNode](ctx, db.SurrealDB, sql, vars)

	if err != nil {
		return []DTO.SubjectNode{}, err
	}
	subjects, err := tools.SafeResult(result, 0)
	if err != nil {
		return []DTO.SubjectNode{}, err
	}

	if len(subjects) == 0 {
		return []DTO.SubjectNode{}, echo.NewHTTPError(http.StatusNotFound, "No hay materias para las carreras proporcionadas")
	}

	return subjects, nil
}

func GetSubjectsGraph(ctx context.Context, careers string) (models.Graph[DTO.SubjectNode], error) {
	subjectsByCareers, err := useGetSubjectsQuery(ctx, careers)

	if err != nil {
		return models.Graph[DTO.SubjectNode]{}, err
	}

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

func GetSubjectsElectiveGraph(ctx context.Context) (models.Graph[DTO.SubjectNodeBase], error) {
	qb := surrealql.Select("subject").
		Field("*").
		Alias("prelations", "id->precede->subject").
		WhereEq("isElective", true)

	sql, vars := qb.Build()

	res, err := surrealdb.Query[[]DTO.SubjectElective](ctx, db.SurrealDB, sql, vars)

	if err != nil {
		return models.Graph[DTO.SubjectNodeBase]{}, err
	}
	subjectsElective, err := tools.SafeResult(res, 0)
	if err != nil {
		return models.Graph[DTO.SubjectNodeBase]{}, err
	}

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
func GetEnrollableSubjects(ctx context.Context, studentId surrealModels.RecordID) ([]surrealModels.RecordID, error) {
	qb := surrealql.Begin().
		Let("enrolled", surrealql.Select("enroll").
			Value("out").
			Where("in = $studentId").
			Where("grade >= 10")).
		Return("?", surrealql.
			Select("subject").
			Value("id").
			// TODO - Por la porqueria de 3.x.x por ahora $enrolled tiene que ser un array
			Where("fn::is_subject_enrollable(id, $studentId, $enrolled.distinct()) = true"))

	sql, params := qb.Build()
	params["studentId"] = studentId

	res, err := surrealdb.Query[[]surrealModels.RecordID](ctx, db.SurrealDB, sql, params)
	if err != nil {
		return nil, err
	}
	// Por alguna razon antes era -1 y ahora tiene que ser -2
	ids, err := tools.SafeResult(res, -2)
	if err != nil {
		return []surrealModels.RecordID{}, nil
	}
	if ids == nil {
		return []surrealModels.RecordID{}, nil
	}
	return ids, nil
}
