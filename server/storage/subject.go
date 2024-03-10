package storage

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/ent"
	"metrograma/ent/career"
	"metrograma/ent/subject"
	"metrograma/models"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func GetAllGreetings(ctx context.Context) ([]string, error) {
	session := db.Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	greetings, err := session.ExecuteRead(
		ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
			result, err := tx.Run(ctx, "MATCH (g:Greeting) RETURN g.message AS greeting", nil)
			if err != nil {
				return nil, err
			}

			var greetings []string
			for result.Next(ctx) {
				greetings = append(greetings, result.Record().Values[0].(string))
			}

			return greetings, result.Err()
		})

	if err != nil {
		return nil, err
	}

	return greetings.([]string), nil
}

func GetSubjectByCareer(ctx context.Context, career string) (models.Graph[models.Subject], error) {
	session := db.Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	graph, err := session.ExecuteRead(
		ctx,
		func(tx neo4j.ManagedTransaction) (interface{}, error) {
			cypher := `
			MATCH (s:Subject)-[:BELONGS_TO]->(c:Career {name: $career})
			OPTIONAL MATCH (s)-[p:PRECEDES]->(s2:Subject)
			RETURN s, p, s2`

			result, err := tx.Run(ctx, cypher, map[string]interface{}{
				"career": career,
			})
			if err != nil {
				return nil, err
			}

			var graph models.Graph[models.Subject]
			// fmt.Println(result)
			nodeMap := make(map[string]models.Node[models.Subject])

			for result.Next(ctx) {
				record := result.Record()
				node_subject1, found := record.Get("s")
				if !found {
					return nil, fmt.Errorf("node not found")
				}
				properties := node_subject1.(neo4j.Node).GetProperties()
				subject := models.Subject{
					Code: properties["code"].(string),
					Name: properties["name"].(string),
				}

				subject1_Id := node_subject1.(neo4j.Node).ElementId

				if _, exists := nodeMap[subject1_Id]; !exists {
					node := models.Node[models.Subject]{
						Id:   subject1_Id,
						Data: subject,
					}

					graph.Nodes = append(graph.Nodes, node)
					nodeMap[subject1_Id] = node
				}

				node_subject2, found := record.Get("s2")
				if found && node_subject2 != nil {
					subject2_Id := node_subject2.(neo4j.Node).ElementId

					edge := models.Edge{From: subject1_Id, To: subject2_Id}
					graph.Edges = append(graph.Edges, edge)
				}
			}
			return graph, result.Err()
		})

	if err != nil {
		return models.Graph[models.Subject]{}, err
	}

	return graph.(models.Graph[models.Subject]), nil
}

func GetSubjectByCareerV2(ctx context.Context, careerName string) (models.Graph[models.Subject], error) {
	career, err := db.EntClient.Career.Query().Where(career.Name(careerName)).First(ctx)
	if err != nil {
		return models.Graph[models.Subject]{}, err
	}

	subjects, err := career.QuerySubjects().WithPrecedesSubject().All(ctx)
	if err != nil {
		return models.Graph[models.Subject]{}, err
	}

	var graph models.Graph[models.Subject]
	graph.Nodes = make([]models.Node[models.Subject], len(subjects))

	for i, s := range subjects {
		graph.Nodes[i] = models.Node[models.Subject]{
			Id: s.ID.String(),
			Data: models.Subject{
				Name: s.SubjectName,
				Code: s.SubjectCode,
			},
		}
		if s.PrecedesSubjectID != nil {
			graph.Edges = append(graph.Edges, models.Edge{
				From: s.PrecedesSubjectID.String(), To: s.ID.String(),
			})
		}
	}

	return graph, nil
}

func CreateSubject(ctx context.Context, subjectName string, subjectCode string, careerName string, trimester uint, precedesCode string) (neo4j.ResultSummary, error) {
	session := db.Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	summary, err := session.ExecuteWrite(
		ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
			cypher := `MATCH (c:Career {name: $careerName})
                       CREATE (s:Subject {name: $subjectName, code: $subjectCode})-[:BELONGS_TO {trimester: $trimester}]->(c)`
			params := map[string]interface{}{
				"subjectName": subjectName,
				"subjectCode": subjectCode,
				"careerName":  careerName,
				"trimester":   trimester,
			}

			if precedesCode != "" {
				cypher += `WITH s MATCH (p:Subject {code: $precedesCode}) CREATE (p)-[:PRECEDES]->(s)`
				params["precedesCode"] = precedesCode
			}

			result, err := tx.Run(ctx, cypher, params)
			if err != nil {
				return nil, err
			}

			return result.Consume(ctx)
		})

	if err != nil {
		return nil, err
	}

	return summary.(neo4j.ResultSummary), nil
}

func CreateSubjectv2(ctx context.Context, subjectName string, subjectCode string, careerName string, trimester uint, precedesSubjectCode *string) (*ent.Subject, error) {
	var precedesSubject *ent.Subject
	var err error
	if precedesSubjectCode != nil {
		precedesSubject, err = db.EntClient.Subject.Query().Where(subject.SubjectCode(*precedesSubjectCode)).First(ctx)
		if err != nil {
			return nil, err
		}
	}

	fmt.Println(careerName)
	career, err := db.EntClient.Career.Query().Where(career.Name(careerName)).First(ctx)
	if err != nil {
		return nil, err
	}

	subject, err := db.EntClient.Subject.
		Create().
		SetSubjectName(subjectName).
		SetSubjectCode(subjectCode).
		SetTrimester(trimester).
		SetPrecedesSubject(precedesSubject).
		AddCarrer(career).
		Save(ctx)

	if err != nil {
		return nil, err
	}

	return subject, nil
}
