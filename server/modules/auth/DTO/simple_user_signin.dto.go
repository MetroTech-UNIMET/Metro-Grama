package DTO

type SimpleUserSigninForm struct {
	FirstName  string `json:"firstName" validate:"required,gte=3,lte=40"`
	LastName   string `json:"lastName" validate:"required,gte=3,lte=40"`
	Email      string `json:"email" validate:"required,unimet_email"`
	Password   string `json:"password" validate:"required,gte=8,lte=40"`
	PictureUrl string `json:"pictureUrl" validate:"required"`
	Verified   bool   `json:"verified" validate:"required"`
	Role       string `json:"role" validate:"required"`
}
