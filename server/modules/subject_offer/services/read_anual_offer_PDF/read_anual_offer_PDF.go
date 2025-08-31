package readanualofferpdf

import (
	"bytes"
	"fmt"
	"metrograma/modules/subject_offer/DTO"
	"net/http"

	"github.com/labstack/echo/v4"
	pdf "github.com/ledongthuc/pdf"
)

// ReadAnualOfferPDF orchestrates loading, header detection, binning & parsing.
func ReadAnualOfferPDF(pdfBuffer *bytes.Buffer) (DTO.ReadResult, error) {
	reader, err := pdf.NewReader(bytes.NewReader(pdfBuffer.Bytes()), int64(pdfBuffer.Len()))
	if err != nil {
		return DTO.ReadResult{}, echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("PDF inválido: %v", err))
	}
	pages := reader.NumPage()

	var all []DTO.SubjectOffer

	for p := 1; p <= pages; p++ {
		pg := reader.Page(p)
		rows, err := pg.GetTextByRow()
		if err != nil {
			return DTO.ReadResult{}, echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("No se pudo leer página %d: %v", p, err))
		}

		header := detectHeaderCols(rows)
		if header == nil && binsFirstPage == nil {
			continue
		}
		enforceIntensiveColumn(header, rows)
		bins := getBinsForPage(header)
		gap := avgColGap(bins.colX) * maxGapFactor

		pageOffers := parsePageSubjects(rows, bins, gap)
		all = append(all, pageOffers...)
	}

	result := DTO.ReadResult{Period: "2526", SubjectOffers: all}
	return result, nil
}
