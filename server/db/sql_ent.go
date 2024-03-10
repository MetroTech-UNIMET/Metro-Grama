package db

import (
	"context"
	"database/sql"
	"log"
	"metrograma/ent"
	"metrograma/ent/migrate"
	"os"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var EntClient *ent.Client

func InitSqlEnt() {
	db, err := sql.Open("pgx", os.Getenv("POSTGRES_URL"))
	if err != nil {
		log.Fatal(err)
	}

	// Create an ent.Driver from `db`.
	drv := entsql.OpenDB(dialect.Postgres, db)
	EntClient = ent.NewClient(ent.Driver(drv))
	ctx := context.Background()

	if err := EntClient.Schema.Create(ctx,
		migrate.WithForeignKeys(true),
		migrate.WithDropIndex(true),
		migrate.WithDropColumn(true),
		migrate.WithForeignKeys(true),
	); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

}
