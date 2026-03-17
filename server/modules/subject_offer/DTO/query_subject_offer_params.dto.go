package DTO

// AnnualOfferQueryParams groups optional query parameters used by subject offer endpoints.
type AnnualOfferQueryParams struct {
	Careers          string `query:"careers" json:"careers"`
	SubjectsFilter   string `query:"subjectsFilter" json:"subjectsFilter"`
	IncludeElectives *bool  `query:"includeElectives" json:"includeElectives,omitempty"`
}

// AnnualOfferByYearQueryParams groups optional query parameters used by annual offer by year endpoint.
type AnnualOfferByYearQueryParams struct {
	Career           string `query:"career" json:"career"`
	IncludeElectives *bool  `query:"includeElectives" json:"includeElectives,omitempty"`
}
