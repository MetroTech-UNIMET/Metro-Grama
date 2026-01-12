package auth

import (
	"metrograma/middlewares"
	"metrograma/modules/auth/DTO"
	"metrograma/modules/auth/services"
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	// Auth routes with stricter rate limiting to prevent brute force attacks
	authGroup := e.Group("/auth", middlewares.AuthRateLimit())
	authGroup.Any("/google/login", services.OauthGoogleLogin)
	authGroup.Any("/google/callback", services.OauthGoogleCallback)
	authGroup.Any("/google/logout", services.OauthGoogleLogout)
	authGroup.POST("/admin/login", adminLogin)
	authGroup.POST("/:id_user/complete-student/", completeStudent)
}

// adminLogin godoc
// @Summary      Admin login
// @Description  Authenticate admin user with credentials
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        credentials  body  DTO.UserLoginForm  true  "Login form"
// @Success      200
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /auth/admin/login [post]
func adminLogin(c echo.Context) error {
	var loginForm DTO.UserLoginForm
	if err := c.Bind(&loginForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(loginForm); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	authResult, err := services.LoginUser(loginForm)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
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

	sessAuth.Values["user-id"] = authResult.User.ID
	if err := sessAuth.Save(c.Request(), c.Response()); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}

// completeStudent godoc
// @Summary      Complete student data
// @Description  Accepts student details and careers with trimesters to complete registration/profile
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        payload  body  DTO.CompleteStudentDTO  true  "Complete student payload"
// @Param        id_user  path  string  true  "User ID"
// @Security     CookieAuth
// @Success      202
// @Failure      400  {object}  map[string]string
// @Router       /auth/{id_user}/complete-student/ [post]
func completeStudent(c echo.Context) error {
	var payload DTO.CompleteStudentDTO
	if err := c.Bind(&payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(payload); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	idUser := c.Param("id_user")

	user, err := services.CompleteStudent(idUser, payload)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusAccepted, user)
}
