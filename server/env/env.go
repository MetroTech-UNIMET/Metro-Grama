package env

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var IsProduction = false
var UserTokenSigninKey = ""
var RecaptchaSecretKey = ""
var GroupNotWorking = false

func LoadDotEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found. Using system environment variables or defaults.")
	}
	UserTokenSigninKey = GetDotEnv("USER_SIGIN_KEY")
	// Optional in dev, required in prod, handled by check
	RecaptchaSecretKey = os.Getenv("RECAPTCHA_SECRET_KEY")

	if val := os.Getenv("MODE"); strings.EqualFold(val, "production") {
		IsProduction = true
	}

	if val := os.Getenv("GROUP_NOT_WORKING"); strings.EqualFold(val, "true") {
		GroupNotWorking = true
	}

	required := []string{"PORT", "USER_SIGIN_KEY", "ADMIN_SIGIN_KEY",
		"SURREAL_HOST", "SURREAL_USER", "SURREAL_PASS", "SURREAL_NS", "SURREAL_DB",
		"FRONTEND_ADDRS", "SERVER_ADDRS"}
	for _, key := range required {
		if os.Getenv(key) == "" {
			log.Fatalf("Required environment variable %s is not set", key)
		}
	}
}

func GetDotEnv(key string) string {
	val := os.Getenv(key)
	if len(val) == 0 {
		log.Panicf("No se pudo encontrar la variable de entorno %s.\n", key)
	}
	return val
}
