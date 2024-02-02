package db

import (
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
