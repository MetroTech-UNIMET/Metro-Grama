package users

import (
	"testing"
)

// REVIEW - Revisar cuando se haga el createStudent

func TestFailSignin(t *testing.T) {
	// e := internal.SetupEcho()
	// users := []models.StudentSigninForm{
	// 	{
	// 		FirstName:      "J",
	// 		LastName:       "Doe",
	// 		Email:          "prueba@correo.unimet.edu.ve",
	// 		Password:       "123456789",
	// 		CareerID:       "career:sistemas",
	// 		PictureUrl:     ">.<",
	// 		SubjectsPassed: []models.SubjectPassed{},
	// 	},
	// 	{
	// 		FirstName:      "Jhon",
	// 		LastName:       "Do",
	// 		Email:          "prueba@correo.unimet.edu.ve",
	// 		Password:       "123456789",
	// 		CareerID:       "career:sistemas",
	// 		PictureUrl:     ">.<",
	// 		SubjectsPassed: []models.SubjectPassed{},
	// 	},
	// 	{
	// 		FirstName:      "Jhon",
	// 		LastName:       "Doe",
	// 		Email:          "prueba@email.com",
	// 		Password:       "123456789",
	// 		CareerID:       "career:sistemas",
	// 		PictureUrl:     ">.<",
	// 		SubjectsPassed: []models.SubjectPassed{},
	// 	},
	// 	{
	// 		FirstName:      "Jhon",
	// 		LastName:       "Doe",
	// 		Email:          "prueba@correo.unimet.edu.ve",
	// 		Password:       "1245",
	// 		CareerID:       "career:sistemas",
	// 		PictureUrl:     ">.<",
	// 		SubjectsPassed: []models.SubjectPassed{},
	// 	},
	// 	{
	// 		FirstName:      "Jhon",
	// 		LastName:       "Doe",
	// 		Email:          "prueba@correo.unimet.edu.ve",
	// 		Password:       "123456789",
	// 		CareerID:       "career:noexiste",
	// 		PictureUrl:     ">.<",
	// 		SubjectsPassed: []models.SubjectPassed{},
	// 	},
	// 	{
	// 		FirstName:  "Jhon",
	// 		LastName:   "Doe",
	// 		Email:      "prueba@correo.unimet.edu.ve",
	// 		Password:   "123456789",
	// 		CareerID:   "career:sistemas",
	// 		PictureUrl: "",
	// 		SubjectsPassed: []models.SubjectPassed{
	// 			{
	// 				ID:        "subject:noexiste",
	// 				Trimester: 1,
	// 			},
	// 		},
	// 	},
	// 	{
	// 		FirstName:  "Jhon",
	// 		LastName:   "Doe",
	// 		Email:      "prueba@correo.unimet.edu.ve",
	// 		Password:   "123456789",
	// 		CareerID:   "career:sistemas",
	// 		PictureUrl: "",
	// 		SubjectsPassed: []models.SubjectPassed{
	// 			{
	// 				ID:        "subject:FBTMM01",
	// 				Trimester: 0,
	// 			},
	// 		},
	// 	},
	// }
	// for _, s := range users {
	// 	c, _ := internal.CreateEchoContextWithJson(t, e, s)
	// 	err := createStudent(c)
	// 	assert.Error(t, err)
	// }
}

func TestDuplicateSignin(t *testing.T) {
	// e := internal.SetupEcho()
	// users := []models.StudentSigninForm{
	// 	{
	// 		FirstName:      "Jane",
	// 		LastName:       "Smith",
	// 		Email:          "prueba@correo.unimet.edu.ve",
	// 		Password:       "123456789",
	// 		CareerID:       "career:sistemas",
	// 		PictureUrl:     ">.<",
	// 		SubjectsPassed: []models.SubjectPassed{},
	// 	},
	// 	{
	// 		FirstName:      "Jhon",
	// 		LastName:       "Doe",
	// 		Email:          "prueba@correo.unimet.edu.ve",
	// 		Password:       "123456789",
	// 		CareerID:       "career:sistemas",
	// 		PictureUrl:     ">.<",
	// 		SubjectsPassed: []models.SubjectPassed{},
	// 	},
	// }
	// storage.DeleteUserByEmail(users[0].Email)
	// {
	// 	c, _ := internal.CreateEchoContextWithJson(t, e, users[0])
	// 	err := createStudent(c)
	// 	assert.NoError(t, err)
	// }
	// {
	// 	c, _ := internal.CreateEchoContextWithJson(t, e, users[1])
	// 	err := createStudent(c)
	// 	storage.DeleteUserByEmail(users[0].Email)
	// 	assert.Error(t, err)
	// }
}
