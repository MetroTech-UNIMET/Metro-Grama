package storage

import (
	"bytes"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"strings"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
)

// const queryGraph = `SELECT <-belong<-subject<-precede as edges, <-belong<-subject as nodes FROM $careerID FETCH edges, edges.in, edges.out, nodes;`
// func GetSubjectByCareer(career string) (models.Graph[models.SubjectNode], error) {
// 	rows, err := db.SurrealDB.Query(queryGraph, map[string]string{
// 		"careerID": tools.ToID("career", career),
// 	})
// 	if err != nil {
// 		return models.Graph[models.SubjectNode]{}, fmt.Errorf("career %s not found", career)
// 	}

// 	careersEdges, err := surrealdb.SmartUnmarshal[[]models.SubjectsEdges](rows, err)

// 	if err != nil {
// 		return models.Graph[models.SubjectNode]{}, err
// 	} else if len(careersEdges) == 0 {
// 		return models.Graph[models.SubjectNode]{}, fmt.Errorf("career '%s' not found", career)
// 	}

// 	nodes := make([]models.Node[models.SubjectNode], len(careersEdges[0].SubjectNodes))
// 	edges := make([]models.Edge, len(careersEdges[0].SubjectEdges))

// 	for i, subjectNode := range careersEdges[0].SubjectNodes {
// 		nodes[i] = models.Node[models.SubjectNode]{
// 			ID: subjectNode.ID,
// 			Data: models.SubjectNode{
// 				Code: subjectNode.ID[len("subject:"):],
// 				Name: subjectNode.Name,
// 			},
// 		}
// 	}

// 	for i, subjectEdge := range careersEdges[0].SubjectEdges {
// 		edges[i] = models.Edge{
// 			From: subjectEdge.From.ID,
// 			To:   subjectEdge.To.ID,
// 		}
// 	}

// 	graph := models.Graph[models.SubjectNode]{
// 		Nodes: nodes,
// 		Edges: edges,
// 	}
// 	return graph, nil
// }

func useGetSubjectsQuery(careers string) (interface{}, error) {
	baseQuery := `SELECT 
	in as subject, 
	array::group(out) as careers,
	array::group(in->precede.out) as prelations
	FROM belong
	$condition
	GROUP BY subject
	FETCH subject`

	if careers == "all" || careers == "" {
		// TODO - Si es all nisiquiara deberia uasr array:group ni GROUP BY
		baseQuery = strings.Replace(baseQuery, "$condition", "", 1)

		return db.SurrealDB.Query(baseQuery, nil)
	} else {
		careersArray := tools.StringToArray(careers)
		baseQuery = strings.Replace(baseQuery, "$condition", "WHERE out IN $careers", 1)

		return db.SurrealDB.Query(baseQuery, map[string][]string{
			"careers": careersArray,
		})
	}
}

const getSubjectsQueryTemplate = `SELECT id as code, name,BPCredits, credits, 
    id->belong.out as careers
    FROM subject
    {{if .CareersNotEmpty}}
    WHERE array::intersect(id->belong.out, $careers) != []
    {{end}}`

func GetSubjects(careers string) ([]models.SubjectNode, error) {
	careersArray := []string{}
	if careers != "none" {
		careersArray = tools.StringToArray(careers)
	}
	careersNotEmpty := len(careersArray) > 0

	// Create a new template and parse the letter into it.
	tmpl, err := template.New("query").Parse(getSubjectsQueryTemplate)
	if err != nil {
		return []models.SubjectNode{}, err
	}

	// Execute the template with the data.
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

	rows, err := db.SurrealDB.Query(query, map[string][]string{
		"careers": careersArray,
	})

	if err != nil {
		return []models.SubjectNode{}, err
	}

	subjects, err := surrealdb.SmartUnmarshal[[]models.SubjectNode](rows, err)

	if err != nil {
		return []models.SubjectNode{}, err
	} else if len(subjects) == 0 {
		return []models.SubjectNode{}, fmt.Errorf("there is no subjects belonging to this careers")
	}

	return subjects, nil

}

func GetSubjectsGraph(careers string) (models.Graph[models.SubjectNode], error) {
	rows, err := useGetSubjectsQuery(careers)

	if err != nil {
		return models.Graph[models.SubjectNode]{}, err
	}

	subjectsByCareers, err := surrealdb.SmartUnmarshal[[]models.SubjectsByCareers](rows, err)

	if err != nil {
		return models.Graph[models.SubjectNode]{}, err
	} else if len(subjectsByCareers) == 0 {
		return models.Graph[models.SubjectNode]{}, fmt.Errorf("there is no subjects belonging to this careers")
	}

	nodes := make([]models.Node[models.SubjectNode], len(subjectsByCareers))
	edges := make([]models.Edge, 0)

	// for i, subjectByCareer := range subjectsByCareers {
	// 	subject := subjectByCareer.Subject

	// 	nodes[i] = models.Node[models.SubjectNode]{
	// 		ID: subject.ID,
	// 		Data: models.SubjectNode{
	// 			Code:    subject.ID[len("subject:"):],
	// 			Name:    subject.Name,
	// 			Careers: subjectByCareer.Careers,
	// 		},
	// 	}

	// 	for _, prelation := range subjectByCareer.Prelations {
	// 		edges = append(edges, models.Edge{
	// 			From: subject.ID,
	// 			To:   prelation,
	// 		})
	// 	}
	// }
	subjectSet := make(map[string]bool, len(subjectsByCareers))
	for i, subjectByCareer := range subjectsByCareers {
		subject := subjectByCareer.Subject
		subjectSet[subject.ID] = true

		nodes[i] = models.Node[models.SubjectNode]{
			ID: subject.ID,
			Data: models.SubjectNode{
				Code:      subject.ID[len("subject:"):],
				Name:      subject.Name,
				Careers:   subjectByCareer.Careers,
				Credits:   subject.Credits,
				BPCredits: subject.BPCredits,
			},
		}
	}

	for _, subjectByCareer := range subjectsByCareers {
		subject := subjectByCareer.Subject

		for _, prelation := range subjectByCareer.Prelations {
			if _, ok := subjectSet[prelation]; !ok {
				continue
			}

			edges = append(edges, models.Edge{
				From: subject.ID,
				To:   prelation,
			})
		}
	}

	graph := models.Graph[models.SubjectNode]{
		Nodes: nodes,
		Edges: edges,
	}
	return graph, nil
}

const createQuery = `
BEGIN TRANSACTION;
CREATE $subjectID SET name=$subjectName;
{{ range $i, $p := .PrecedesID }}
RELATE $precedeID{{$i}}->precede->$subjectID;
{{end}}
{{ range $i, $c := .Careers }}
RELATE $subjectID->belong->$careerID{{$i}} SET trimester = $trimester{{$i}};
{{end}}
COMMIT TRANSACTION;	
`

func CreateSubject(subject models.SubjectForm) error {
	t, err := template.New("query").Parse(createQuery)
	if err != nil {
		return err
	}
	var query bytes.Buffer
	err = t.Execute(&query, subject)
	if err != nil {
		return err
	}

	queryParams := map[string]interface{}{
		"subjectID":   subject.Code,
		"subjectName": subject.Name,
	}

	for i, p := range subject.PrecedesID {
		queryParams[fmt.Sprintf("precedeID%d", i)] = p
	}

	for i, c := range subject.Careers {
		queryParams[fmt.Sprintf("careerID%d", i)] = c.CareerID
		queryParams[fmt.Sprintf("trimester%d", i)] = c.Trimester
	}

	data, err := db.SurrealDB.Query(query.String(), queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func DeleteSubject(subjectID string) error {
	_, err := db.SurrealDB.Delete(subjectID)
	return err
}
