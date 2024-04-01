package db

import "github.com/surrealdb/surrealdb.go"

var SurrealDB *surrealdb.DB

func InitSurrealDB() {
	db, err := surrealdb.New("ws://localhost:8000/rpc")
	if err != nil {
		panic(err)
	}
	if _, err = SurrealDB.Signin(map[string]interface{}{
		"user": "root",
		"pass": "root",
	}); err != nil {
		panic(err)
	}
	if _, err = db.Use("test", "test"); err != nil {
		panic(err)
	}

	SurrealDB = db
}
