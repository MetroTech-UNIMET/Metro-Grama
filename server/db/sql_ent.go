package db

import (
	"context"
	"log"
	"metrograma/ent"
	"metrograma/ent/migrate"

	"entgo.io/ent/dialect"
	_ "github.com/mattn/go-sqlite3"
)

var EntClient ent.Client

func InitSqlEnt() {
	client, err := ent.Open(dialect.SQLite, "file:db.sqlite3?cache=shared&_fk=1&_pragma=foreign_keys(1)")
	if err != nil {
		log.Panic(err)
	}

	ctx := context.Background()

	if err := client.Schema.Create(ctx,
		migrate.WithForeignKeys(true),
		migrate.WithDropIndex(true),
		migrate.WithDropColumn(true),
		migrate.WithForeignKeys(true),
	); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	EntClient = *client
}
