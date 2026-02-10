package readanualofferpdf

import (
	"math"
	"strings"

	pdf "github.com/ledongthuc/pdf"
)

// detectHeaderCols locates the header row (at least 2 of T1/T2/T3) and returns its X positions.
func detectHeaderCols(rows pdf.Rows) map[string]float64 {
	for _, row := range rows {
		rowCols := map[string]float64{}
		for _, w := range row.Content {
			txt := strings.TrimSpace(w.S)
			if _, ok := colToIndex[txt]; !ok {
				continue
			}
			if prev, seen := rowCols[txt]; !seen || w.X < prev {
				rowCols[txt] = w.X
			}
		}
		tCount := 0
		for _, T := range []string{"T1", "T2", "T3"} {
			if _, ok := rowCols[T]; ok {
				tCount++
			}
		}
		if tCount >= 2 {
			return rowCols
		}
	}
	return nil
}

// enforceIntensiveColumn makes sure "I" is to the right of "T3", or re‐finds it.
func enforceIntensiveColumn(colX map[string]float64, rows pdf.Rows) {
	if xi, ok := colX["I"]; ok {
		if xt3, ok3 := colX["T3"]; ok3 && xi <= xt3 {
			delete(colX, "I")
		}
	}
	if _, found := colX["I"]; !found {
		if xt3, ok3 := colX["T3"]; ok3 {
			bestX := math.Inf(1)
			for _, row := range rows {
				for _, w := range row.Content {
					if strings.TrimSpace(w.S) == "I" && w.X > xt3 && w.X < bestX {
						bestX = w.X
					}
				}
			}
			if !math.IsInf(bestX, 1) {
				colX["I"] = bestX
			}
		}
	}
}

// getBinsForPage returns a binsDef for this page, caching the first‐page bins.
func getBinsForPage(colX map[string]float64) *binsDef {
	if len(colX) >= 3 {
		b := makeBins(colX)
		binsFirstPage = b
		return b
	}
	return binsFirstPage
}
