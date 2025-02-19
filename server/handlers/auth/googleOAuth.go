package auth

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"metrograma/auth"
	"metrograma/env"
	"metrograma/models"
	"metrograma/storage"
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"golang.org/x/oauth2"
)

type GoogleEmailData struct {
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	HD            string `json:"hd"`
}

func oauthGoogleLogin(c echo.Context) error {
	sess, err := session.Get("session", c)
	if err != nil {
		return err
	}
	sess.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   60 * 5,
		HttpOnly: true,
	}
	if env.IsProduction {
		sess.Options.Secure = true
	}
	oauthState := generateStateOauthCookie()

	sess.Values["state"] = oauthState
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	u := auth.GoogleOauthConfig.AuthCodeURL(oauthState, oauth2.SetAuthURLParam("hd", "correo.unimet.edu.ve"))

	return c.Redirect(http.StatusTemporaryRedirect, u)
}

func oauthGoogleLogout(c echo.Context) error {
	sessAuth, err := session.Get("auth", c)
	if err != nil {
		return err
	}
	delete(sessAuth.Values, "user-id")
	if err := sessAuth.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	return c.NoContent(http.StatusAccepted)
}

func oauthGoogleCallback(c echo.Context) error {
	sess, err := session.Get("session", c)
	if err != nil {
		return err
	}

	state := sess.Values["state"]

	if c.QueryParam("state") != state {
		return echo.NewHTTPError(http.StatusUnauthorized, fmt.Errorf("invalid session state: %s", state))
	}

	tok, err := auth.GoogleOauthConfig.Exchange(c.Request().Context(), c.QueryParam("code"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	client := auth.GoogleOauthConfig.Client(c.Request().Context(), tok)
	email, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}
	defer email.Body.Close()
	data, _ := io.ReadAll(email.Body)

	googleEmailData := new(GoogleEmailData)
	json.Unmarshal(data, googleEmailData)

	if googleEmailData.HD != "correo.unimet.edu.ve" && googleEmailData.HD != "unimet.edu.ve" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("the email domain %s is not allowed", googleEmailData.HD))
	}

	dbUser, err := storage.ExistUserByEmail(googleEmailData.Email)
	if err != nil {
		if err := storage.CreateSimpleUser(models.SimpleUserSigninForm{
			FirstName:  googleEmailData.GivenName,
			LastName:   googleEmailData.FamilyName,
			Email:      googleEmailData.Email,
			Password:   tok.AccessToken,
			PictureUrl: googleEmailData.Picture,
			Verified:   true,
		}); err != nil {
			return echo.NewHTTPError(http.StatusConflict, err)
		}

		dbUser, _ = storage.ExistUserByEmail(googleEmailData.Email)
	}

	sessAuth, err := session.Get("auth", c)
	sessAuth.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
	}
	if env.IsProduction {
		sessAuth.Options.SameSite = http.SameSiteStrictMode
		sessAuth.Options.Secure = true
	}

	if err != nil {
		return err
	}

	sessAuth.Values["user-id"] = dbUser.ID.String()
	if err := sessAuth.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	return c.Redirect(http.StatusPermanentRedirect, fmt.Sprintf("%s/materias", env.GetDotEnv("FRONTEND_ADDRS")))
}

func generateStateOauthCookie() string {
	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)

	return state
}
