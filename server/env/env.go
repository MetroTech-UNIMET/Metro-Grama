package env

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var IsProduction = false
var UserTokenSigninKey = ""

func LoadDotEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found. Using system environment variables or defaults.")
	}
	UserTokenSigninKey = GetDotEnv("USER_SIGIN_KEY")

	if val := os.Getenv("MODE"); val == "Production" {
		IsProduction = true
	}
}

func GetDotEnv(key string) string {
	val := os.Getenv(key)
	if len(val) == 0 {
		log.Panicf("No se pudo encontrar la variable de entorno %s.\n", key)
	}
	return val
}
