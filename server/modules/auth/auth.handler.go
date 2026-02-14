package auth

import (
	"metrograma/middlewares"
	"metrograma/modules/auth/DTO"
	"metrograma/modules/auth/services"
	"net/http"

	"github.com/labstack/echo/v4"
)

type AuthTokenResponse struct {
	Token        string          `json:"token"`
	User         DTO.MinimalUser `json:"user"`
	RedirectPath string          `json:"redirectPath"`
	Message      string          `json:"message"`
}

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

	userIDString, ok := (authResult.User.ID.ID).(string)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to convert user ID to string")
	}
	roleIDString, ok := (authResult.User.Role.ID).(string)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to convert role ID to string")
	}

	token, err := services.GenerateAccessToken(userIDString, roleIDString)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, AuthTokenResponse{
		Token:        token,
		User:         authResult.User,
		RedirectPath: authResult.RedirectPath,
		Message:      authResult.Message,
	})
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
