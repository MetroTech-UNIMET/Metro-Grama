package services

import (
	"fmt"
	"metrograma/env"
	"metrograma/modules/auth/DTO"
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/markbates/goth/gothic"
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
	// Store optional redirect path requested by caller (e.g. Swagger UI)
	sess, err := session.Get("session", c)
	if err == nil {
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   60 * 5,
			HttpOnly: true,
		}
		if env.IsProduction {
			sess.Options.Secure = true
			sess.Options.SameSite = http.SameSiteNoneMode
		}
		if r := c.QueryParam("redirect"); r != "" {
			// Basic sanitization: allow relative root paths or same-host absolute URLs
			if isAllowedRedirect(r, c.Request()) {
				sess.Values["redirect"] = r
			}
		}
		sess.Save(c.Request(), c.Response())
	}

	// Tell Goth we are using "google"
	q := c.Request().URL.Query()
	q.Add("provider", "google")
	c.Request().URL.RawQuery = q.Encode()

	gothic.BeginAuthHandler(c.Response(), c.Request())
	return nil
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
	gothic.Logout(c.Response(), c.Request())
	return c.NoContent(http.StatusAccepted)
}

func OauthGoogleCallback(c echo.Context) error {
	// Tell Goth we are using "google"
	q := c.Request().URL.Query()
	q.Add("provider", "google")
	c.Request().URL.RawQuery = q.Encode()

	user, err := gothic.CompleteUserAuth(c.Response(), c.Request())
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	// Verify Hosted Domain (HD) if available in raw data
	// Goth Google provider puts raw user info in user.RawData
	if hd, ok := user.RawData["hd"].(string); ok {
		if hd != "correo.unimet.edu.ve" && hd != "unimet.edu.ve" {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("the email domain %s is not allowed", hd))
		}
	} else if user.Email != "" && !strings.HasSuffix(user.Email, "@correo.unimet.edu.ve") && !strings.HasSuffix(user.Email, "@unimet.edu.ve") {
		// Fallback check if HD param is missing but email is present
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Errorf("the email domain is not allowed"))
	}

	registerResult, err := RegisterUser(DTO.SimpleUserSigninForm{
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		Email:      user.Email,
		Password:   user.AccessToken,
		PictureUrl: user.AvatarURL,
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
		sessAuth.Options.SameSite = http.SameSiteNoneMode
		sessAuth.Options.Secure = true
	}

	sessAuth.Values["user-id"] = registerResult.User.ID.ID
	if err := sessAuth.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	// Retrieve redirect URL from our session
	sess, _ := session.Get("session", c)
	finalRedirect := registerResult.RedirectPath
	// Only allow the redirect override if:
	// 1. The user logic (GetAuthResult) allows it (IsVerified = true).
	//    If IsVerified is false, we MUST go to registration page.
	if registerResult.IsVerified {
		if r, ok := sess.Values["redirect"].(string); ok && r != "" {
			finalRedirect = r
			// Clear it
			delete(sess.Values, "redirect")
			sess.Save(c.Request(), c.Response())
		}
	}

	return c.Redirect(http.StatusPermanentRedirect, finalRedirect)
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
