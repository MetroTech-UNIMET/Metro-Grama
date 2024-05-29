package students

import (
	"metrograma/handlers/internal"
	"metrograma/models"
	"metrograma/storage"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFailSignin(t *testing.T) {
	e := internal.SetupEcho()
	students := []models.StudentSigninForm{
		{
			FirstName:      "J",
			LastName:       "Doe",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			PictureUrl:     ">.<",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Do",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			PictureUrl:     ">.<",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Doe",
			Email:          "prueba@email.com",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			PictureUrl:     ">.<",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Doe",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "1245",
			CareerID:       "career:sistemas",
			PictureUrl:     ">.<",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Doe",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:noexiste",
			PictureUrl:     ">.<",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:  "Jhon",
			LastName:   "Doe",
			Email:      "prueba@correo.unimet.edu.ve",
			Password:   "123456789",
			CareerID:   "career:sistemas",
			PictureUrl: "",
			SubjectsPassed: []models.SubjectPassed{
				{
					ID:        "subject:noexiste",
					Trimester: 1,
				},
			},
		},
		{
			FirstName:  "Jhon",
			LastName:   "Doe",
			Email:      "prueba@correo.unimet.edu.ve",
			Password:   "123456789",
			CareerID:   "career:sistemas",
			PictureUrl: "",
			SubjectsPassed: []models.SubjectPassed{
				{
					ID:        "subject:FBTMM01",
					Trimester: 0,
				},
			},
		},
	}
	for _, s := range students {
		c, _ := internal.CreateEchoContextWithJson(t, e, s)
		err := createStudent(c)
		assert.Error(t, err)
	}
}

func TestDuplicateSignin(t *testing.T) {
	e := internal.SetupEcho()
	students := []models.StudentSigninForm{
		{
			FirstName:      "Jane",
			LastName:       "Smith",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			PictureUrl:     ">.<",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Doe",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			PictureUrl:     ">.<",
			SubjectsPassed: []models.SubjectPassed{},
		},
	}
	storage.DeleteStudentByEmail(students[0].Email)
	{
		c, _ := internal.CreateEchoContextWithJson(t, e, students[0])
		err := createStudent(c)
		assert.NoError(t, err)
	}
	{
		c, _ := internal.CreateEchoContextWithJson(t, e, students[1])
		err := createStudent(c)
		storage.DeleteStudentByEmail(students[0].Email)
		assert.Error(t, err)
	}
}
