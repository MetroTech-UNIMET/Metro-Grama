package DTO

type CompleteStudentDTO struct {
	CareersWithTrimesters []CareerWithTrimester `json:"careersWithTrimesters" validate:"required,dive"`
	IDCard                int64                 `json:"id_card" validate:"required,gte=1"`
	Phone                 string                `json:"phone" validate:"required"`
}

type CareerWithTrimester struct {
	Career    string `json:"career" validate:"required"`
	Trimester string `json:"trimester" validate:"required"`
}
