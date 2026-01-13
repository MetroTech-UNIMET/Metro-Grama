package DTO

type ReadResult struct {
	Period        string         `json:"period"`
	SubjectOffers []SubjectOffer `json:"subject_offers"`
}

type SubjectOffer struct {
	Code       string   `json:"code"`
	Trimesters []string `json:"trimesters"`
}
