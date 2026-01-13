package db

import (
	"context"
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
	db, err := surrealdb.FromEndpointURLString(context.Background(), fmt.Sprintf("ws://%s/rpc", env.GetDotEnv("SURREAL_HOST")))
	if err != nil {
		panic(err.Error())
	}
	if err = db.Use(context.Background(), env.GetDotEnv("SURREAL_NS"), env.GetDotEnv("SURREAL_DB")); err != nil {
		panic(err)
	}

	auth := &surrealdb.Auth{
		Username: env.GetDotEnv("SURREAL_USER"),
		Password: env.GetDotEnv("SURREAL_PASS"),
	}

	if _, err = db.SignIn(context.Background(), auth); err != nil {
		panic(err)
	}

	SurrealDB = db
}
