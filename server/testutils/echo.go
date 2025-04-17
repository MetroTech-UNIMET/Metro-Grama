package testutils

import (
	"bytes"
	"encoding/json"
	"metrograma/db"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func SetupEcho() *echo.Echo {
	os.Setenv("SURREAL_HOST", "localhost:8000")
	os.Setenv("SURREAL_USER", "root")
	os.Setenv("SURREAL_PASS", "root")
	os.Setenv("SURREAL_NS", "test")
	os.Setenv("SURREAL_DB", "test")

	db.InitSurrealDB()

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	return e
}

func CreateEchoContextWithJson(t *testing.T, e *echo.Echo, data interface{}) (echo.Context, *httptest.ResponseRecorder) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(jsonBytes))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	return c, rec
} 