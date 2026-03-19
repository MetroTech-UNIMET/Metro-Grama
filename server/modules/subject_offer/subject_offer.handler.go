package subject_offer

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strconv"

	rateLimitMiddlewares "metrograma/middlewares"
	authMiddlewares "metrograma/modules/auth/middlewares"
	"metrograma/modules/subject_offer/DTO"
	"metrograma/modules/subject_offer/services"
	readpdf "metrograma/modules/subject_offer/services/read_anual_offer_PDF"
	"metrograma/tools"

	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func Handlers(e *echo.Group) {
	subject_offerGroup := e.Group("/subject_offer")

	// TODO - Si se encuetnra con una materia que no existe, igual la añade a la oferta.
	// Pero no pararece /annual/:year dado que no está en belong
	// Write operations have rate limiting (50 req/min per IP)
	subject_offerGroup.POST("/upload", uploadPDF, rateLimitMiddlewares.WriteRateLimit())
	subject_offerGroup.POST("/batch", batchUpdateSubjectOffers, rateLimitMiddlewares.WriteRateLimit())
	subject_offerGroup.POST("/:subjectId", createSubjectOffer, rateLimitMiddlewares.WriteRateLimit())

	subject_offerGroup.DELETE("/:subjectId", deleteSubjectOffer, rateLimitMiddlewares.WriteRateLimit())

	subject_offerGroup.GET("/annual/:year", getAnnualOfferByYear)
	subject_offerGroup.GET("/:trimesterId", getSubjectOfferById)
}

var academicYearRegexp = regexp.MustCompile(`^[0-9]{4}$`)

func validateAcademicYear(year string) error {
	if !academicYearRegexp.MatchString(year) {
		return echo.NewHTTPError(http.StatusBadRequest, "Año académico inválido. Use el patrón 2122, 2223, 2324.")
	}
	start := int(year[0]-'0')*10 + int(year[1]-'0')
	end := int(year[2]-'0')*10 + int(year[3]-'0')
	if start == 99 || end != start+1 {
		return echo.NewHTTPError(http.StatusBadRequest, "Año académico inválido. Use el patrón 2122, 2223, 2324.")
	}
	return nil
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
	err = services.CreateSubjectOffer(c.Request().Context(), subjectOffer)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("Error al crear oferta: %v", err))
	}
	return c.JSON(http.StatusCreated, map[string]any{"message": "Oferta académica procesada correctamente", "result": subjectOffer})
}

// getAnnualOfferById godoc
// @Summary      List subject_offer edges filtered by trimester ID
// @Description  Returns subject_offer edges for the specified trimester
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        trimesterId     path      string  true   "Trimester ID"
// @Param        careers         query     string  false   "careers filter (comma-separated RecordIDs)"
// @Param        subjectsFilter  query     string  false  "Filtro de materias: 'enrollable' o 'none' (default 'none')" Enums(enrollable,none) default(none)
// @Param        includeElectives query     bool    false  "Incluir materias electivas (default false)"
// @Description  Nota: Cuando subjectsFilter='enrollable' se requiere sesión de estudiante (student-id en la sesión).
// @Success      200       {array}   DTO.QueryAnnualOffer
// @Failure      500       {object}  map[string]string
// @Router       /subject_offer/{trimesterId} [get]
func getSubjectOfferById(c echo.Context) error {
	trimesterId := c.Param("trimesterId")
	queryParams := DTO.AnnualOfferQueryParams{
		Careers:        c.QueryParam("careers"),
		SubjectsFilter: c.QueryParam("subjectsFilter"),
	}
	if includeElectivesRaw := c.QueryParam("includeElectives"); includeElectivesRaw != "" {
		includeElectives, err := strconv.ParseBool(includeElectivesRaw)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "includeElectives inválido. Use 'true' o 'false'")
		}
		queryParams.IncludeElectives = &includeElectives
	}
	if (queryParams.Careers == "" || queryParams.Careers == "none") && queryParams.IncludeElectives == nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Debe enviar al menos uno: 'careers' o 'includeElectives'")
	}
	// Validate parsed careers contains at least 1 valid RecordID only when careers is provided.
	if queryParams.Careers != "" && queryParams.Careers != "none" {
		if ids := tools.StringToIdArray(queryParams.Careers); len(ids) == 0 {
			return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'careers' debe contener al menos 1 carrera válida")
		}
	}

	// Always attempt to get student (may be nil if not logged in)
	student, _ := authMiddlewares.GetStudentFromSession(c)

	if queryParams.SubjectsFilter == "" {
		queryParams.SubjectsFilter = "none"
	}
	if queryParams.SubjectsFilter != "none" && queryParams.SubjectsFilter != "enrollable" {
		return echo.NewHTTPError(http.StatusBadRequest, "subjectsFilter inválido. Use 'enrollable' o 'none'")
	}

	var studentId surrealModels.RecordID
	if student != nil {
		studentId = student.ID
	}
	// If enrollable requested but no student, force empty response early (no error thrown per requirement not to throw)
	if queryParams.SubjectsFilter == "enrollable" && student == nil {
		return c.JSON(http.StatusOK, []any{})
	}

	offers, err := services.GetSubjectOfferById(c.Request().Context(), trimesterId, studentId, queryParams)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, offers)
}

// getAnnualOfferByYear godoc
// @Summary      Lista oferta anual por año académico
// @Description  Devuelve materias con su período (trimester plan) y los trimestres en los que se ofrece dentro del año académico dado.
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        career  query string false  "Filtro de carreras (RecordID)"
// @Param        includeElectives query bool false "Incluir materias electivas (default false)"
// @Param        year     path  string true  "Año académico (e.g. 2425)"
// @Success      200 {array} DTO.QueryAnnualOfferYear
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /subject_offer/annual/{year} [get]
func getAnnualOfferByYear(c echo.Context) error {
	queryParams := DTO.AnnualOfferByYearQueryParams{
		Career: c.QueryParam("career"),
	}
	if includeElectivesRaw := c.QueryParam("includeElectives"); includeElectivesRaw != "" {
		includeElectives, err := strconv.ParseBool(includeElectivesRaw)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "includeElectives inválido. Use 'true' o 'false'")
		}
		queryParams.IncludeElectives = &includeElectives
	}

	year := c.Param("year")
	if (queryParams.Career == "" || queryParams.Career == "none") && (queryParams.IncludeElectives == nil || !*queryParams.IncludeElectives) {
		return echo.NewHTTPError(http.StatusBadRequest, "Debe enviar al menos uno: 'career' o 'includeElectives'")
	}

	if year == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'year' es requerido")
	}
	if err := validateAcademicYear(year); err != nil {
		return err
	}

	var careerID *surrealModels.RecordID
	if queryParams.Career != "" && queryParams.Career != "none" {
		parsedCareerID, err := surrealModels.ParseRecordID(queryParams.Career)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "El parámetro 'career' no es un RecordID válido")
		}
		careerID = parsedCareerID
	}

	result, err := services.QueryAnnualOfferByYear(c.Request().Context(), careerID, year, queryParams)
	if err != nil {
		if he, ok := err.(*echo.HTTPError); ok {
			return he
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, result)
}

// createSubjectOffer godoc
// @Summary      Create subject_offer relation
// @Description  Creates a relation between a subject (path param) and a trimester (body)
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        subjectId   path  string                     true  "Subject ID"
// @Param        payload     body  DTO.CreateSubjectOfferRequest  true  "Create subject offer payload"
// @Security     CookieAuth
// @Success      202
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /subject_offer/{subjectId} [post]
func createSubjectOffer(c echo.Context) error {
	subjectIdParam := c.Param("subjectId")
	if subjectIdParam == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "subjectId es requerido")
	}
	subjectId := surrealModels.NewRecordID("subject", subjectIdParam)

	var body DTO.CreateSubjectOfferRequest
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	subjectOffer, err := services.RelateSubjectToTrimester(c.Request().Context(), subjectId, body.TrimesterId)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, map[string]any{"message": "Relación creada correctamente", "data": subjectOffer})
}

// createSubjectOffer godoc
// @Summary      Delete subject_offer relation
// @Description  Deletes a relation between a subject (path param) and a trimester (body)
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        subjectId   path  string                     true  "Subject ID"
// @Param        payload     body  DTO.CreateSubjectOfferRequest  true  "Create subject offer payload"
// @Security     CookieAuth
// @Success      202
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /subject_offer/{subjectId} [delete]
func deleteSubjectOffer(c echo.Context) error {
	subjectIdParam := c.Param("subjectId")
	if subjectIdParam == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "subjectId es requerido")
	}
	subjectId := surrealModels.NewRecordID("subject", subjectIdParam)

	var body DTO.CreateSubjectOfferRequest
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	subjectOffer, err := services.UnRelateSubjectFromTrimester(c.Request().Context(), subjectId, body.TrimesterId)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, map[string]any{"message": "Relación creada correctamente", "data": subjectOffer})
}

// @Summary      Actualización por lotes de oferta académica
// @Description  Permite agregar y eliminar ofertas de materias en múltiples trimestres a la vez.
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        body body DTO.BatchUpdateOffersRequest true "Datos de actualización"
// @Success      200 {object} map[string]string
// @Failure      400 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /subject_offer/batch [post]
func batchUpdateSubjectOffers(c echo.Context) error {
	var req DTO.BatchUpdateOffersRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}

	// Verify Captcha
	valid, err := tools.VerifyRecaptcha(req.Captcha, "batch_update_offers")
	if err != nil {
		// Log error internally if needed
		return echo.NewHTTPError(http.StatusInternalServerError, "Error verifying captcha")
	}
	if !valid {
		return echo.NewHTTPError(http.StatusForbidden, "Captcha verification failed")
	}

	if err := services.BatchUpdateSubjectOffers(c.Request().Context(), req.Changes); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Oferta actualizada correctamente"})
}
