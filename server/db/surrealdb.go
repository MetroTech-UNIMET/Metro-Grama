package db

import (
	"fmt"
	"metrograma/env"

	"github.com/surrealdb/surrealdb.go"
)

var SurrealDB *surrealdb.DB

type SurrealErrMsg struct {
	Result string `json:"result"`
	Status string `json:"status"`
	Time   string `json:"time"`
}

func InitSurrealDB() {
	db, err := surrealdb.New(fmt.Sprintf("ws://%s/rpc", env.GetDotEnv("SURREAL_HOST")))
	if err != nil {
		panic(err.Error())
	}
	if err = db.Use(env.GetDotEnv("SURREAL_NS"), env.GetDotEnv("SURREAL_DB")); err != nil {
		panic(err)
	}
	if _, err = db.SignIn(&surrealdb.Auth{
		Username: env.GetDotEnv("SURREAL_USER"),
		Password: env.GetDotEnv("SURREAL_PASS"),
	}); err != nil {
		panic(err)
	}

	SurrealDB = db
}
