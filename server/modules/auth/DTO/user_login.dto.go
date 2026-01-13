package DTO

type UserLoginForm struct {
	Email    string `form:"email" json:"email" validate:"required,unimet_email"`
	Password string `form:"password" json:"password" validate:"required,gte=8,lte=40"`
}
