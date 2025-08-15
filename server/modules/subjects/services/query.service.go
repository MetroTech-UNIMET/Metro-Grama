package services

import (
	"bytes"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"strings"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
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

		return surrealdb.Query[[]models.SubjectsByCareers](db.SurrealDB, baseQuery, nil)
	} else {
		careersArray := tools.StringToIdArray(careers)

		baseQuery = strings.Replace(baseQuery, "$condition", "WHERE out IN $careersId", 1)
		baseQuery = strings.Replace(baseQuery, "$prelationsConditions", "[WHERE ->belong.out ANYINSIDE $careersId]", 1)

		return surrealdb.Query[[]models.SubjectsByCareers](db.SurrealDB, baseQuery, map[string]any{
			"careersId": careersArray,
		})
	}
}

const getSubjectsQueryTemplate = `SELECT id as code, name, BPCredits, credits, 
    ->belong->career as careers
    FROM subject
    {{if .CareersNotEmpty}}
    WHERE array::intersect(->belong->career, $careers) != []
    {{end}}`

func GetSubjects(careers string) ([]models.SubjectNode, error) {
	careersArray := []surrealModels.RecordID{}
	if careers != "none" {
		careersArray = tools.StringToIdArray(careers)
	}
	careersNotEmpty := len(careersArray) > 0

	tmpl, err := template.New("query").Parse(getSubjectsQueryTemplate)
	if err != nil {
		return []models.SubjectNode{}, err
	}

	var queryBuffer bytes.Buffer
	err = tmpl.Execute(&queryBuffer, struct {
		CareersNotEmpty bool
	}{
		CareersNotEmpty: careersNotEmpty,
	})
	if err != nil {
		return []models.SubjectNode{}, err
	}

	query := queryBuffer.String()

	queryParams := map[string]any{
		"careers": careersArray,
	}

	result, err := surrealdb.Query[[]models.SubjectNode](db.SurrealDB, query, queryParams)

	if err != nil {
		fmt.Println(err)
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
