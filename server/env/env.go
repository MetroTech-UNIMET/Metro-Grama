package env

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadDotEnv() {
	if err := godotenv.Load(); err != nil {
		log.Panicln(err)
	}
}

func GetDotEnv(key string) string {
	val := os.Getenv(key)
	if len(val) == 0 {
		log.Panicf("No se pudo encontrar la variable de entorno %s.\n", key)
	}
	return val
}
