package subject_offer

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	"metrograma/modules/subject_offer/services"
	readpdf "metrograma/modules/subject_offer/services/read_anual_offer_PDF"

	"github.com/labstack/echo/v4"
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
// @Description  Returns subject_offer edges with related subject and trimester
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Success      200       {array}   DTO.QueryAnnualOffer
// @Failure      500       {object}  map[string]string
// @Router       /subject_offer/ [get]
func getAnualOffer(c echo.Context) error {
	offers, err := services.GetAllAnnualOffers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, offers)
}

// getAnnualOfferById godoc
// @Summary      List subject_offer edges filtered by trimester ID
// @Description  Returns subject_offer edges for the specified trimester
// @Tags         subject_offer
// @Accept       json
// @Produce      json
// @Param        trimesterId path string true "Trimester ID"
// @Success      200       {array}   DTO.QueryAnnualOffer
// @Failure      500       {object}  map[string]string
// @Router       /subject_offer/{trimesterId} [get]
func getAnualOfferById(c echo.Context) error {
	trimesterId := c.Param("trimesterId")
	offers, err := services.GetAnnualOfferById(trimesterId)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, offers)
}
