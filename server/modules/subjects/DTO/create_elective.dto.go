package DTO

type SubjectElectiveForm struct {
	Name       string   `json:"name" validate:"required"`
	Code       string   `json:"code" validate:"required"`
	Prelations []string `json:"prelations" validate:"required"`
}
