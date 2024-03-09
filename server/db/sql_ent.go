package db

import (
	"log"
	"metrograma/ent"

	"entgo.io/ent/dialect"
	_ "github.com/mattn/go-sqlite3"
)

var EntClient ent.Client

func InitSqlEnt() {
	client, err := ent.Open(dialect.SQLite, "db.sqlite3")
	if err != nil {
		log.Panic(err)
	}
	EntClient = *client
}
