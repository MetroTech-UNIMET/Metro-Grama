package services

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"metrograma/auth"
	"metrograma/env"
	"metrograma/modules/auth/DTO"
	"net/http"
	"net/url"
	"strings"

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

func OauthGoogleLogin(c echo.Context) error {
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

	// Store optional redirect path requested by caller (e.g. Swagger UI)
	if r := c.QueryParam("redirect"); r != "" {
		// Basic sanitization: allow relative root paths or same-host absolute URLs
		if isAllowedRedirect(r, c.Request()) {
			sess.Values["redirect"] = r
		}
	}
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	u := auth.GoogleOauthConfig.AuthCodeURL(oauthState, oauth2.SetAuthURLParam("hd", "correo.unimet.edu.ve"))

	return c.Redirect(http.StatusTemporaryRedirect, u)
}

func OauthGoogleLogout(c echo.Context) error {
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

func OauthGoogleCallback(c echo.Context) error {
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

	registerResult, err := RegisterUser(DTO.SimpleUserSigninForm{
		FirstName:  googleEmailData.GivenName,
		LastName:   googleEmailData.FamilyName,
		Email:      googleEmailData.Email,
		Password:   tok.AccessToken,
		PictureUrl: googleEmailData.Picture,
	})

	if err != nil {
		return echo.NewHTTPError(http.StatusConflict, err)
	}

	sessAuth, err := session.Get("auth", c)
	if err != nil {
		return err
	}
	sessAuth.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
	}
	if env.IsProduction {
		sessAuth.Options.SameSite = http.SameSiteStrictMode
		sessAuth.Options.Secure = true
	}

	sessAuth.Values["user-id"] = registerResult.User.ID.ID
	if err := sessAuth.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	finalRedirect := registerResult.RedirectPath

	return c.Redirect(http.StatusPermanentRedirect, finalRedirect)
}

func generateStateOauthCookie() string {
	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)
	return state
}

// isAllowedRedirect performs minimal validation to avoid open redirect vulnerabilities.
// It allows:
//  1. Relative paths starting with '/'
//  2. Absolute URLs whose host matches the incoming request host
func isAllowedRedirect(target string, req *http.Request) bool {
	if strings.HasPrefix(target, "/") {
		return true
	}
	u, err := url.Parse(target)
	if err != nil {
		return false
	}
	if u.Host == req.Host && (u.Scheme == "http" || u.Scheme == "https") {
		return true
	}
	return false
}

func GetGoogleUserInfo(client *http.Client) (*GoogleEmailData, error) {
	email, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return nil, err
	}
	defer email.Body.Close()
	data, _ := io.ReadAll(email.Body)

	googleEmailData := new(GoogleEmailData)
	if err := json.Unmarshal(data, googleEmailData); err != nil {
		return nil, err
	}

	if googleEmailData.HD != "correo.unimet.edu.ve" && googleEmailData.HD != "unimet.edu.ve" {
		return nil, fmt.Errorf("the email domain %s is not allowed", googleEmailData.HD)
	}

	return googleEmailData, nil
}
