package subjects

import (
	"encoding/json"
	"metrograma/models"
	"metrograma/modules/subjects/DTO"
	"metrograma/modules/subjects/services"
	"metrograma/testutils"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

type SubjectCase int

const (
	SubjectSuccess SubjectCase = iota
	SubjectWithNonExistingPrecedesSubjects
	SubjectWithNonExistingCareer
	SubjectInvalidBody
)

var subjectMockData = map[SubjectCase]models.SubjectForm{
	SubjectSuccess: {
		Name: "Esta materia no exite :p",
		Code: surrealModels.NewRecordID("subject", "QWERT12"),
		Careers: []models.SubjectCareer{
			{
				Trimester: 9,
				CareerID:  "career:sistemas",
			},
		},
		PrecedesID: []string{
			"subject:BPTMI01", "subject:BPTFI01",
		},
	},
	SubjectWithNonExistingPrecedesSubjects: {
		Name: "Esta materia no exite :p",
		Code: surrealModels.NewRecordID("subject", "QWERT12"),
		Careers: []models.SubjectCareer{
			{
				Trimester: 9,
				CareerID:  "career:sistemas",
			},
		},
		PrecedesID: []string{
			"subject:NoExiste", "subject:EsteTambien",
		},
	},
	SubjectWithNonExistingCareer: {
		Name: "Esta materia no exite :p",
		Code: surrealModels.NewRecordID("subject", "QWERT12"),
		Careers: []models.SubjectCareer{
			{
				Trimester: 9,
				CareerID:  "career:NoExiste",
			},
		},
		PrecedesID: []string{
			"subject:BPTMI01", "subject:BPTFI01",
		},
	},
	SubjectInvalidBody: {
		Name: "",
		Code: surrealModels.NewRecordID("subject", ""),
		Careers: []models.SubjectCareer{
			{
				Trimester: 0,
				CareerID:  "",
			},
		},
		PrecedesID: []string{
			"", "",
		},
	},
}

func TestCreateSubject(t *testing.T) {
	e := testutils.SetupEcho()
	subjectMock := subjectMockData[SubjectSuccess]

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	c, rec := testutils.CreateEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusCreated, rec.Code)
	}
}

func TestDuplicateCreateSubject(t *testing.T) {
	e := testutils.SetupEcho()
	subjectMock := subjectMockData[SubjectSuccess]
	codeId := surrealModels.NewRecordID("subject", subjectMock.Code)

	services.DeleteSubject(codeId)

	subjectMock2 := subjectMock
	err := services.CreateSubject(subjectMock)
	assert.NoError(t, err)

	c, _ := testutils.CreateEchoContextWithJson(t, e, subjectMock2)
	err = createSubject(c)
	httpErr := err.(*echo.HTTPError)

	services.DeleteSubject(codeId)

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, http.StatusConflict, httpErr.Code)
}

func TestCreateSubjectWithNonExistingPrecedesSubjects(t *testing.T) {
	e := testutils.SetupEcho()
	subjectMock := subjectMockData[SubjectWithNonExistingPrecedesSubjects]

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	c, _ := testutils.CreateEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)
	httpErr := err.(*echo.HTTPError)

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, httpErr.Code, http.StatusNotFound, err)
}

func TestCreateSubjectWithNonExistingCareer(t *testing.T) {
	e := testutils.SetupEcho()
	subjectMock := subjectMockData[SubjectWithNonExistingCareer]

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	c, _ := testutils.CreateEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)

	httpErr := err.(*echo.HTTPError)

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, httpErr.Code, http.StatusNotFound, err)
}

func TestCreateSubjectWithInvalidBody(t *testing.T) {
	e := testutils.SetupEcho()
	subjectMock := subjectMockData[SubjectInvalidBody]

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	c, _ := testutils.CreateEchoContextWithJson(t, e, subjectMock)
	err := createSubject(c)

	httpErr := err.(*echo.HTTPError)

	services.DeleteSubject(surrealModels.NewRecordID("subject", subjectMock.Code))

	assert.Error(t, err, "Create subject must fail")
	assert.Equal(t, httpErr.Code, http.StatusBadRequest, err)
}

var edgesMock = []models.Edge{
	{
		From: "subject:FBTMM01",
		To:   "subject:BPTMI01",
	},
	{
		From: "subject:FBTMM01",
		To:   "subject:BPTQI21",
	},
	{
		From: "subject:BPTQI21",
		To:   "subject:BPTQI22",
	},
	{
		From: "subject:BPTMI01",
		To:   "subject:BPTMI02",
	},
	{
		From: "subject:BPTMI01",
		To:   "subject:BPTMI30",
	},
	{
		From: "subject:BPTMI01",
		To:   "subject:BPTFI01",
	},
	{
		From: "subject:BPTFI01",
		To:   "subject:BPTFI02",
	},
	{
		From: "subject:BPTFI02",
		To:   "subject:BPTFI05",
	},
	{
		From: "subject:BPTMI02",
		To:   "subject:BPTMI03",
	},
	{
		From: "subject:BPTMI02",
		To:   "subject:BPTFI02",
	},
	{
		From: "subject:BPTMI03",
		To:   "subject:BPTMI04",
	},
	{
		From: "subject:BPTMI03",
		To:   "subject:BPTMI31",
	},
	{
		From: "subject:BPTMI03",
		To:   "subject:BPTMI06",
	},
	{
		From: "subject:BPTMI04",
		To:   "subject:BPTMI05",
	},
	{
		From: "subject:BPTMI04",
		To:   "subject:BPTMI11",
	},
}

func TestBasicSubjectsGraph(t *testing.T) {
	e := testutils.SetupEcho()

	req := httptest.NewRequest(http.MethodGet, "/?filter=all", strings.NewReader(""))
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err := getSubjectsGraph(c)

	if assert.NoError(t, err) {
		graph := new(models.Graph[DTO.SubjectNode])
		err := json.Unmarshal(rec.Body.Bytes(), graph)
		assert.NoError(t, err)
		matchs := 0

		for _, e := range graph.Edges {
			for _, eMock := range edgesMock {
				if e.From == eMock.From && e.To == eMock.To {
					matchs += 1
				}
			}
		}
		assert.Equal(t, matchs, len(edgesMock))
	}
}
