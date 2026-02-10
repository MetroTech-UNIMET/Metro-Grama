package readanualofferpdf

import "math"

// binsDef holds ordered column names and their X positions.
type binsDef struct {
	columns []string
	colX    []float64
}

func (b *binsDef) colForX(x float64) (string, bool) {
	best, bestd := "", math.MaxFloat64
	for i, cx := range b.colX {
		if d := math.Abs(x - cx); d < bestd {
			bestd, best = d, b.columns[i]
		}
	}
	if best == "" {
		return "", false
	}
	return best, true
}

func makeBins(colX map[string]float64) *binsDef {
	cols, pos := make([]string, 0, len(colX)), make([]float64, 0, len(colX))
	for _, h := range colHeaders {
		if x, ok := colX[h]; ok {
			cols, pos = append(cols, h), append(pos, x)
		}
	}
	return &binsDef{columns: cols, colX: pos}
}

func avgColGap(xs []float64) float64 {
	if len(xs) < 2 {
		return 0
	}
	sum := 0.0
	for i := 1; i < len(xs); i++ {
		sum += xs[i] - xs[i-1]
	}
	return sum / float64(len(xs)-1)
}
