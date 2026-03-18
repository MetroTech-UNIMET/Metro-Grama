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
	protocol := "ws"
	if env.IsProduction {
		protocol = "wss"
	}

	db, err := surrealdb.FromEndpointURLString(context.Background(), fmt.Sprintf("%s://%s/rpc", protocol, env.GetDotEnv("SURREAL_HOST")))
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

func HealthCheck(ctx context.Context) error {
	_, err := surrealdb.Query[any](ctx, SurrealDB, "RETURN true", nil)
	return err
}

// TODO
// fix — add reconnection (longer-term): Wrap SurrealDB in a struct with mutex-protected reconnection logic:

// type DBClient struct {
//     mu sync.RWMutex
//     db *surrealdb.DB
// }

// func (c *DBClient) Get() *surrealdb.DB {
//     c.mu.RLock()
//     defer c.mu.RUnlock()
//     return c.db
// }

// func (c *DBClient) Reconnect(ctx context.Context) error {
//     c.mu.Lock()
//     defer c.mu.Unlock()
//     // ... reconnection logic
// }
