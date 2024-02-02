package storage

import (
	"context"
	"metrograma/db"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type Node[T any] struct {
	Id   string
	Data T
}

type Edge struct {
	From string
	To   string
}

type Graph[T any] struct {
	Nodes []Node[T]
	Edges []Edge
}

func HelloWorld(ctx context.Context) (neo4j.Node, error) {
	session := db.Neo4j.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
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
