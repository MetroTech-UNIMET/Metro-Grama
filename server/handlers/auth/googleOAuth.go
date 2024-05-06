package auth

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"metrograma/auth"
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
		MaxAge:   86400 * 7,
		HttpOnly: true,
	}
	oauthState := generateStateOauthCookie()

	sess.Values["state"] = oauthState
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	u := auth.GoogleOauthConfig.AuthCodeURL(oauthState, oauth2.SetAuthURLParam("hd", "unimet.edu.ve"))

	return c.Redirect(http.StatusTemporaryRedirect, u)
}

func oauthGoogleLogout(c echo.Context) error {
	return c.NoContent(http.StatusNotImplemented)
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

	if googleEmailData.HD != "correo.unimet.edu.ve" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("the email domain %s is not allowed", googleEmailData.HD))
	}

	dbUser, err := storage.ExistStudent(googleEmailData.Email)
	if err != nil {
		if err := storage.CreateSimpleStudent(models.SimpleStudentSigninForm{
			FirstName:  googleEmailData.GivenName,
			LastName:   googleEmailData.FamilyName,
			Email:      googleEmailData.Email,
			Password:   tok.AccessToken,
			PictureUrl: googleEmailData.Picture,
		}); err != nil {
			return echo.NewHTTPError(http.StatusConflict, err)
		}
	}

	sessAuth, err := session.Get("auth", c)
	sessAuth.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
	}
	if err != nil {
		return err
	}

	sessAuth.Values["user-id"] = dbUser.ID
	if err := sessAuth.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	return nil
}

func generateStateOauthCookie() string {
	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)

	return state
}
