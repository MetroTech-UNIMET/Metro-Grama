package DTO

// BatchSubjectOfferChange represents changes for a single subject
type BatchSubjectOfferChange struct {
	SubjectID string   `json:"subjectId" validate:"required"`
	Add       []string `json:"add"`    // List of Trimester IDs
	Remove    []string `json:"remove"` // List of Trimester IDs
}

// BatchUpdateOffersRequest contains a list of subject changes
type BatchUpdateOffersRequest struct {
	Changes []BatchSubjectOfferChange `json:"changes" validate:"required"`
	Captcha string                    `json:"captcha"` // for reCAPTCHA validation
}
