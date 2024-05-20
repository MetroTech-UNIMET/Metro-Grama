package auth

import (
	"fmt"
	"metrograma/env"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var GoogleOauthConfig *oauth2.Config

func InitGoogleOauth() {
	GoogleOauthConfig = &oauth2.Config{
		RedirectURL:  fmt.Sprintf("%s/api/auth/google/callback", env.GetDotEnv("SERVER_ADDRS")),
		ClientID:     env.GetDotEnv("GOOGLE_CLIENT_ID"),
		ClientSecret: env.GetDotEnv("GOOGLE_CLIENT_SECRET"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}
