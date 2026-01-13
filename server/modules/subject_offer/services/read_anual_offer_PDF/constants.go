package readanualofferpdf

import "regexp"

var (
	reCodigo      = regexp.MustCompile(`^[A-Z]{2,6}\d{2,4}|FPSXXXX$`)
	reRoman       = regexp.MustCompile(`^(FUERA DE\s+TRIMESTRE|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)$`)
	reXMarca      = regexp.MustCompile(`(?i)^x(?:\(\*\))?$`) // X, x, x(*)
	colHeaders    = []string{"T1", "T2", "T3", "I"}          // I = Intensivo
	colToIndex    = map[string]int{"T1": 0, "T2": 1, "T3": 2, "I": 3}
	maxGapFactor  = 0.55 // qué tan lejos puede estar una "X" de la x de la cabecera más cercana (en % de la distancia media entre columnas)
	binsFirstPage *binsDef
)
