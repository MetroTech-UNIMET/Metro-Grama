package db

import (
	"fmt"
	"os"

	"github.com/surrealdb/surrealdb.go"
)

var SurrealDB *surrealdb.DB

func InitSurrealDB() {
	db, err := surrealdb.New(fmt.Sprintf("ws://%s/rpc", os.Getenv("SURREAL_HOST")))
	if err != nil {
		panic(err.Error())
	}
	if _, err = db.Signin(map[string]interface{}{
		"user": os.Getenv("SURREAL_USER"),
		"pass": os.Getenv("SURREAL_PASS"),
	}); err != nil {
		panic(err)
	}
	if _, err = db.Use(os.Getenv("SURREAL_NS"), os.Getenv("SURREAL_DB")); err != nil {
		panic(err)
	}

	SurrealDB = db
}
