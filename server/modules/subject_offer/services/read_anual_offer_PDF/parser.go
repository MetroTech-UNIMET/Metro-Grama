package readanualofferpdf

import (
	"math"
	"metrograma/modules/subject_offer/DTO"
	"sort"
	"strings"

	pdf "github.com/ledongthuc/pdf"
)

// parsePageSubjects walks the rows and extracts all SubjectOffer entries.
func parsePageSubjects(rows pdf.Rows, bins *binsDef, maxGap float64) []DTO.SubjectOffer {
	var out []DTO.SubjectOffer
	var current *DTO.SubjectOffer

	flush := func() {
		if current == nil {
			return
		}
		// dedupe & sort
		uniq := map[string]struct{}{}
		for _, t := range current.Trimesters {
			uniq[t] = struct{}{}
		}
		current.Trimesters = current.Trimesters[:0]
		for t := range uniq {
			current.Trimesters = append(current.Trimesters, t)
		}
		sort.Strings(current.Trimesters)
		out = append(out, *current)
		current = nil
	}

	for _, row := range rows {
		// new code?
		for _, w := range row.Content {
			txt := strings.TrimSpace(w.S)
			if reCodigo.MatchString(txt) {
				flush()
				current = &DTO.SubjectOffer{Code: txt}
				break
			}
		}
		if current == nil {
			continue
		}
		for _, w := range row.Content {
			raw := strings.TrimSpace(w.S)
			if !reXMarca.MatchString(raw) {
				continue
			}
			col, ok := bins.colForX(w.X)
			if !ok {
				// fallback nearest
				best, dist := "", math.Inf(1)
				for i, cx := range bins.colX {
					d := math.Abs(w.X - cx)
					if d < dist {
						dist, best = d, bins.columns[i]
					}
				}
				if dist > maxGap {
					continue
				}
				col = best
			}
			current.Trimesters = append(current.Trimesters, col)
		}
	}
	flush()
	return out
}
