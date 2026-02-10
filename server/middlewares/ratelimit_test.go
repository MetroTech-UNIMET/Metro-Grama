package middlewares

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestGlobalRateLimit(t *testing.T) {
	e := echo.New()

	// Apply the rate limiter middleware
	middleware := GlobalRateLimit()

	// Create a simple handler
	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	// Wrap handler with middleware
	h := middleware(handler)

	// Make requests within rate limit (should all succeed)
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Real-IP", "192.168.1.1")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestAuthRateLimit(t *testing.T) {
	e := echo.New()

	middleware := AuthRateLimit()

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	h := middleware(handler)

	// Make requests within rate limit (should all succeed)
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodPost, "/auth/login", nil)
		req.Header.Set("X-Real-IP", "192.168.1.2")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestFriendRateLimit(t *testing.T) {
	e := echo.New()

	middleware := FriendRateLimit()

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	h := middleware(handler)

	// Make requests within rate limit (should all succeed)
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodPost, "/friend/add", nil)
		req.Header.Set("X-Real-IP", "192.168.1.3")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestWriteRateLimit(t *testing.T) {
	e := echo.New()

	middleware := WriteRateLimit()

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	h := middleware(handler)

	// Make requests within rate limit (should all succeed)
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodPost, "/enroll", nil)
		req.Header.Set("X-Real-IP", "192.168.1.4")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}

func TestRateLimitDifferentIPs(t *testing.T) {
	e := echo.New()

	middleware := GlobalRateLimit()

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	h := middleware(handler)

	// Different IPs should each have their own rate limit
	ips := []string{"10.0.0.1", "10.0.0.2", "10.0.0.3"}

	for _, ip := range ips {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Real-IP", ip)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	}
}
