package handlers

import (
	"bytes"
	"encoding/json"
	"metrograma/models"
	"metrograma/storage"
	"metrograma/tools"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

type SubjectCase int

const (
	SubjectSuccess SubjectCase = iota
	SubjectWithNonExistingPrecedesSubjects
	SubjectWithNonExistingCarrer
	SubjectInvalidBody
)

var subjectMockData = map[SubjectCase]models.SubjectForm{
	SubjectSuccess: {
		Name: "Esta materia no exite :p",
		Code: "QWERT12",
		Carrers: []models.CarrerForm{
			{
				Trimester: 9,
				CarrerID:  "carrer:sistemas",
			},
		},
		PrecedesID: []string{
			"subject:BPTMI01", "subject:BPTFI01",
		},
	},
	SubjectWithNonExistingPrecedesSubjects: {
		Name: "Esta materia no exite :p",
		Code: "QWERT12",
		Carrers: []models.CarrerForm{
			{
				Trimester: 9,
				CarrerID:  "carrer:sistemas",
			},
		},
		PrecedesID: []string{
			"subject:NoExiste", "subject:EsteTambien",
		},
	},
	SubjectWithNonExistingCarrer: {
		Name: "Esta materia no exite :p",
		Code: "QWERT12",
		Carrers: []models.CarrerForm{
			{
				Trimester: 9,
				CarrerID:  "carrer:NoExiste",
			},
		},
		PrecedesID: []string{
			"subject:BPTMI01", "subject:BPTFI01",
		},
	},
	SubjectInvalidBody: {
		Name: "",
		Code: "",
		Carrers: []models.CarrerForm{
			{
				Trimester: 0,
				CarrerID:  "",
			},
		},
		PrecedesID: []string{
			"", "",
		},
	},
}

func createEchoContextWithJson(t *testing.T, e *echo.Echo, data interface{}) (echo.Context, *httptest.ResponseRecorder) {
	buf, err := json.Marshal(data)
	assert.NoError(t, err, "Fail to encode subject to json")

	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(buf))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	return c, rec
}

func TestCreateSubject(t *testing.T) {
	e := tools.SetupEcho()
	subjectMock := subjectMockData[SubjectSuccess]

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	c, rec := createEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusCreated, rec.Code)
	}
}

func TestDuplicateCreateSubject(t *testing.T) {
	e := tools.SetupEcho()
	subjectMock := subjectMockData[SubjectSuccess]
	subjectMock.Code = tools.ToID("subject", subjectMock.Code)

	storage.DeleteSubject(subjectMock.Code)

	subjectMock2 := subjectMock
	err := storage.CreateSubject(subjectMock)
	assert.NoError(t, err)

	c, _ := createEchoContextWithJson(t, e, subjectMock2)
	err = createSubject(c)
	httpErr := err.(*echo.HTTPError)

	storage.DeleteSubject(subjectMock.Code)

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, http.StatusConflict, httpErr.Code)
}

func TestCreateSubjectWithNonExistingPrecedesSubjects(t *testing.T) {
	e := tools.SetupEcho()
	subjectMock := subjectMockData[SubjectWithNonExistingPrecedesSubjects]

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	c, _ := createEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)
	httpErr := err.(*echo.HTTPError)

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, httpErr.Code, http.StatusNotFound, err)
}

func TestCreateSubjectWithNonExistingCarrer(t *testing.T) {
	e := tools.SetupEcho()
	subjectMock := subjectMockData[SubjectWithNonExistingCarrer]

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	c, _ := createEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)

	httpErr := err.(*echo.HTTPError)

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, httpErr.Code, http.StatusNotFound, err)
}

func TestCreateSubjectWithInvalidBody(t *testing.T) {
	e := tools.SetupEcho()
	subjectMock := subjectMockData[SubjectInvalidBody]

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	c, _ := createEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)

	httpErr := err.(*echo.HTTPError)

	storage.DeleteSubject(tools.ToID("subject", subjectMock.Code))

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, httpErr.Code, http.StatusBadRequest, err)
}
