package db

import (
	"context"
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

func helloWorld(ctx context.Context, uri, username, password string) (string, error) {
	session := Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	greeting, err := session.ExecuteWrite(ctx, func(transaction neo4j.ManagedTransaction) (any, error) {
		result, err := transaction.Run(ctx,
			"CREATE (a:Greeting) SET a.message = $message RETURN a.message + ', from node ' + id(a)",
			map[string]any{"message": "hello, world"})
		if err != nil {
			return nil, err
		}

		if result.Next(ctx) {
			return result.Record().Values[0], nil
		}

		return nil, result.Err()
	})
	if err != nil {
		return "", err
	}

	return greeting.(string), nil
}
