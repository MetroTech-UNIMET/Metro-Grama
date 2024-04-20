package handlers

import (
	"metrograma/models"
	"metrograma/tools"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFailSignin(t *testing.T) {
	e := tools.SetupEcho()
	students := []models.StudentSigninForm{
		{
			FirstName:      "J",
			LastName:       "Doe",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Do",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Doe",
			Email:          "prueba@email.com",
			Password:       "123456789",
			CareerID:       "career:sistemas",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Doe",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "1245",
			CareerID:       "career:sistemas",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName:      "Jhon",
			LastName:       "Doe",
			Email:          "prueba@correo.unimet.edu.ve",
			Password:       "123456789",
			CareerID:       "career:noexiste",
			SubjectsPassed: []models.SubjectPassed{},
		},
		{
			FirstName: "Jhon",
			LastName:  "Doe",
			Email:     "prueba@correo.unimet.edu.ve",
			Password:  "123456789",
			CareerID:  "career:sistemas",
			SubjectsPassed: []models.SubjectPassed{
				{
					ID:        "subject:noexiste",
					Trimester: 1,
				},
			},
		},
		{
			FirstName: "Jhon",
			LastName:  "Doe",
			Email:     "prueba@correo.unimet.edu.ve",
			Password:  "123456789",
			CareerID:  "career:sistemas",
			SubjectsPassed: []models.SubjectPassed{
				{
					ID:        "subject:FBTMM01",
					Trimester: 0,
				},
			},
		},
	}
	for _, s := range students {
		c, _ := createEchoContextWithJson(t, e, s)
		err := signin(c)
		assert.Error(t, err)
	}
}
