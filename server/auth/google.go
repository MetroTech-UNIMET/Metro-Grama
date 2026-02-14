package auth

import (
	"fmt"
	"net/http"

	"metrograma/env"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

func InitGoogleOauth() {
	store := sessions.NewCookieStore([]byte(env.UserTokenSigninKey))
	store.Options.HttpOnly = true
	store.Options.Secure = env.IsProduction
	store.Options.Path = "/"
	if env.IsProduction {
		store.Options.SameSite = http.SameSiteNoneMode
	} else {
		store.Options.SameSite = http.SameSiteLaxMode
	}
	gothic.Store = store

	googleProvider := google.New(
		env.GetDotEnv("GOOGLE_CLIENT_ID"),
		env.GetDotEnv("GOOGLE_CLIENT_SECRET"),
		fmt.Sprintf("%s/api/auth/google/callback", env.GetDotEnv("SERVER_ADDRS")),
		"email", "profile",
	)

	// Set the hosted domain using the provided method
	// You can change "unimet.edu.ve" to your specific domain or load it from env
	googleProvider.SetHostedDomain("correo.unimet.edu.ve")

	goth.UseProviders(googleProvider)
}
