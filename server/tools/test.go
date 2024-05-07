package tools

import (
	"bytes"
	"encoding/json"
	"metrograma/db"
	"metrograma/middlewares"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func SetupEcho() *echo.Echo {
	os.Setenv("SURREAL_HOST", "localhost:8000")
	os.Setenv("SURREAL_USER", "root")
	os.Setenv("SURREAL_PASS", "root")
	os.Setenv("SURREAL_NS", "test")
	os.Setenv("SURREAL_DB", "test")

	db.InitSurrealDB()

	e := echo.New()
	e.Validator = middlewares.NewValidator()
	return e
}

func CreateEchoContextWithJson(t *testing.T, e *echo.Echo, data interface{}) (echo.Context, *httptest.ResponseRecorder) {
	buf, err := json.Marshal(data)
	assert.NoError(t, err, "Fail to encode subject to json")

	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(buf))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	return c, rec
}
