package db

import (
	"context"
	"fmt"
	"log"
	"metrograma/env"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

var Neo4j neo4j.DriverWithContext

func InitNeo4j() {
	driver, err := neo4j.NewDriverWithContext(env.GetDotEnv("NEO4J_URI"), neo4j.BasicAuth(env.GetDotEnv("NEO4J_USERNAME"), env.GetDotEnv("NEO4J_PASSWORD"), ""))
	if err != nil {
		log.Panicln(err)
	}
	Neo4j = driver
}

func HelloWorld(ctx context.Context) (neo4j.Node, error) {
	session := Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)
	// RETURN a.message + ', from node ' + id(a)

	greeting, err := neo4j.ExecuteWrite[neo4j.Node](
		ctx,     // (1)
		session, // (2)
		func(transaction neo4j.ManagedTransaction) (neo4j.Node, error) {
			result, err := transaction.Run(ctx,
				"Create (sub: Subject {code: 'FBTMM01', name: 'Matemática Básica'}) RETURN sub.code",
				nil)
			if err != nil {
				return *new(neo4j.Node), err
			}

			return neo4j.SingleTWithContext(ctx, result, func(record *neo4j.Record) (neo4j.Node, error) {
				node, _, err := neo4j.GetRecordValue[neo4j.Node](record, "code")
				return node, err
			},
			)

		},
	)

	if err != nil {
		return *new(neo4j.Node), err
	}

	return greeting, nil
}

func GetAllGreetings(ctx context.Context) ([]string, error) {
	session := Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
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

type Subject struct {
	Code string
	Name string
}

func GetSubjectByCareer(ctx context.Context, career string) ([]Subject, error) {
	session := Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	subjects, err := session.ExecuteRead(
		ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
			result, err := tx.Run(ctx, "MATCH (s:Subject)-[:BELONGS_TO]->(c:Career {name: $career}) RETURN s", map[string]interface{}{
				"career": career,
			})
			if err != nil {
				return nil, err
			}

			var subjects []Subject
			for result.Next(ctx) {
				record := result.Record()
				node, found := record.Get("s")
				if !found {
					return nil, fmt.Errorf("node not found")
				}
				properties := node.(neo4j.Node).GetProperties()
				subject := Subject{
					Code: properties["code"].(string),
					Name: properties["name"].(string),
				}
				subjects = append(subjects, subject)
			}

			return subjects, result.Err()
		})

	if err != nil {
		return nil, err
	}

	return subjects.([]Subject), nil
}

func CreateSubject(ctx context.Context, subjectName string, subjectCode string, careerName string, trimester int, precedesCode string) (neo4j.ResultSummary, error) {
	session := Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	summary, err := session.ExecuteWrite(
		ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
			cypher := `MATCH (c:Career {name: $careerName})
                       CREATE (s:Subject {name: $subjectName, code: $subjectCode})-[:BELONGS_TO {trimester: $trimester}]->(c)`
			params := map[string]interface{}{
				"subjectName": subjectName,
				"subjectCode": subjectCode,
				"careerName":  careerName,
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
