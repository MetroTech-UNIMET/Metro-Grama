package subject_offer

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	"metrograma/modules/auth/middlewares"
	"metrograma/modules/subject_offer/services"
	readpdf "metrograma/modules/subject_offer/services/read_anual_offer_PDF"
	"metrograma/tools"

	"github.com/labstack/echo/v4"
	"github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	subject_offerGroup := e.Group("/subject_offer")
	subject_offerGroup.POST("/upload", uploadPDF)
	subject_offerGroup.GET("/", getAnualOffer)
	subject_offerGroup.GET("/:trimesterId", getAnualOfferById)
}

// @Summary   Subir oferta académica (PDF)
// @Description Sube un archivo PDF de oferta académica. Máx 100 KB. Content-Type: application/pdf.
// @Tags      subject_offer
// @Accept    mpfd
// @Produce   json
// @Param     file formData file true "Archivo PDF"
// @Success   201 {object} map[string]string
// @Failure   400 {object} map[string]string
// @Failure   500 {object} map[string]string
// @Router    /subject_offer/upload [post]
func uploadPDF(c echo.Context) error {
	// Leer archivo del form-data con key "file"
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "No se pudo leer el archivo")
	}

	// Validar extensión
	if file.Header.Get("Content-Type") != "application/pdf" {
		return echo.NewHTTPError(http.StatusBadRequest, "El archivo debe ser un PDF")
	}

	// Validar tamaño (máx 100KB)
	if file.Size > 100*1024 {
		return echo.NewHTTPError(http.StatusBadRequest, "El archivo supera los 100 KB")
	}

	// Abrir archivo temporalmente
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Error al abrir el archivo")
	}
	defer src.Close()

	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, src); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Error al copiar archivo a buffer")
	}

	subjectOffer, err := readpdf.ReadAnualOfferPDF(buf)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Error al procesar PDF: %v", err))
	}
	err = services.CreateSubjectOffer(subjectOffer)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Error al crear oferta: %v", err))
	}
	return c.JSON(http.StatusCreated, map[string]any{"message": "Oferta académica procesada correctamente", "result": subjectOffer})
}

// getAnualOffer godoc
// @Summary      List all subject_offer edges
// @Description  Returns subject_offer edges with related subject and trimester. Optional filter by careers (CSV of record IDs). Use careers=none to get an error.
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        careers         query     string  true   "careers filter (comma-separated RecordIDs)"
// @Param        subjectsFilter  query     string  false  "Filtro de materias: 'enrollable' o 'none' (default 'none')" Enums(enrollable,none) default(none)
// @Description  Nota: Cuando subjectsFilter='enrollable' se requiere sesión de estudiante (student-id en la sesión). No enviar studentId por query.
// @Success      200       {array}   DTO.QueryAnnualOffer
// @Failure      500       {object}  map[string]string
// @Router       /subject_offer/ [get]
func getAnualOffer(c echo.Context) error {
	careers := c.QueryParam("careers")
	if careers == "" || careers == "none" {
		return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'careers' es requerido y debe contener al menos 1 carrera")
	}
	// Validate parsed careers contains at least 1 valid RecordID
	if ids := tools.StringToIdArray(careers); len(ids) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'careers' debe contener al menos 1 carrera válida")
	}
	// Always attempt to get student, ignore error here (no trimester filtering endpoint)
	_, _ = middlewares.GetStudentFromSession(c)
	offers, err := services.GetAllAnnualOffers(careers)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, offers)
}

// getAnnualOfferById godoc
// @Summary      List subject_offer edges filtered by trimester ID
// @Description  Returns subject_offer edges for the specified trimester
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        trimesterId     path      string  true   "Trimester ID"
// @Param        careers         query     string  true   "careers filter (comma-separated RecordIDs)"
// @Param        subjectsFilter  query     string  false  "Filtro de materias: 'enrollable' o 'none' (default 'none')" Enums(enrollable,none) default(none)
// @Description  Nota: Cuando subjectsFilter='enrollable' se requiere sesión de estudiante (student-id en la sesión).
// @Success      200       {array}   DTO.QueryAnnualOffer
// @Failure      500       {object}  map[string]string
// @Router       /subject_offer/{trimesterId} [get]
func getAnualOfferById(c echo.Context) error {
	trimesterId := c.Param("trimesterId")
	careers := c.QueryParam("careers")
	if careers == "" || careers == "none" {
		return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'careers' es requerido y debe contener al menos 1 carrera")
	}
	// Validate parsed careers contains at least 1 valid RecordID
	if ids := tools.StringToIdArray(careers); len(ids) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'careers' debe contener al menos 1 carrera válida")
	}

	// Always attempt to get student (may be nil if not logged in)
	student, _ := middlewares.GetStudentFromSession(c)

	subjectsFilter := c.QueryParam("subjectsFilter")
	if subjectsFilter == "" {
		subjectsFilter = "none"
	}
	if subjectsFilter != "none" && subjectsFilter != "enrollable" {
		return echo.NewHTTPError(http.StatusBadRequest, "subjectsFilter inválido. Use 'enrollable' o 'none'")
	}

	var studentId models.RecordID
	if student != nil {
		studentId = student.ID
	}
	// If enrollable requested but no student, force empty response early (no error thrown per requirement not to throw)
	if subjectsFilter == "enrollable" && student == nil {
		return c.JSON(http.StatusOK, []any{})
	}

	qp := services.AnnualOfferQueryParams{Careers: careers, SubjectsFilter: subjectsFilter}
	offers, err := services.GetAnnualOfferById(trimesterId, studentId, qp)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, offers)
}
