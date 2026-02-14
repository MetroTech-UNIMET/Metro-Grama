package auth

import (
	"context"
	"metrograma/modules/auth/DTO"
	"metrograma/modules/auth/services"
	crud "metrograma/modules/auth/services/crud"
	"metrograma/testutils"
	"net/http"
	"testing"

	"metrograma/db"

	"github.com/stretchr/testify/assert"
	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func TestInstitutionalEmailDomain(t *testing.T) {
	// Req 1: Ingreso con correo institucional
	testutils.SetupEcho()

	tests := []struct {
		name      string
		email     string
		shouldErr bool
	}{
		{
			name:      "Valid Student Email",
			email:     "student@correo.unimet.edu.ve",
			shouldErr: false,
		},
		{
			name:      "Valid Admin Email",
			email:     "admin@unimet.edu.ve",
			shouldErr: false,
		},
		{
			name:      "Invalid Gmail",
			email:     "hacker@gmail.com",
			shouldErr: true,
		},
		{
			name:      "Invalid Yahoo",
			email:     "someone@yahoo.com",
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			form := DTO.SimpleUserSigninForm{
				Email:     tt.email,
				FirstName: "Test",
				LastName:  "User",
				Password:  "token",
			}
			// Cleanup before test
			existing, _ := crud.ExistUserByEmail(tt.email)
			if existing != nil {
				crud.DeleteUserByEmail(tt.email)
			}

			_, err := services.RegisterUser(form)
			if tt.shouldErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestCompleteStudent_RegistrationAndCareerSelection(t *testing.T) {
	// Req 2: Registro de estudiante y selección de carrera
	e := testutils.SetupEcho()

	// 1. Setup Data (Seed Career and Trimester)
	surrealdb.Delete[any](context.Background(), db.SurrealDB, surrealModels.NewRecordID("career", "sistemas"))
	_, err := surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("career"), map[string]any{
		"id":   surrealModels.NewRecordID("career", "sistemas"),
		"name": "Ingeniería de Sistemas",
	})
	assert.NoError(t, err)

	surrealdb.Delete[any](context.Background(), db.SurrealDB, surrealModels.NewRecordID("trimester", "202520261"))
	_, err = surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("trimester"), map[string]any{
		"id":   surrealModels.NewRecordID("trimester", "202520261"),
		"name": "2025-2026-1",
	})
	assert.NoError(t, err)

	// 2. Create a user first
	email := "newstudent@correo.unimet.edu.ve"
	form := DTO.SimpleUserSigninForm{
		Email:     email,
		FirstName: "New",
		LastName:  "Student",
		Password:  "token",
	}

	// Cleanup
	existing, _ := crud.ExistUserByEmail(email)
	if existing != nil {
		crud.DeleteUserByEmail(email)
	}

	res, err := services.RegisterUser(form)
	assert.NoError(t, err)
	userID := res.User.ID.ID.(string)

	// 3. Prepare payload
	payload := DTO.CompleteStudentDTO{
		IDCard: 12345678,
		Phone:  "+584121234567",
		CareersWithTrimesters: []DTO.CareerWithTrimester{
			{
				Career:    "sistemas",
				Trimester: "202520261",
			},
		},
	}

	// 4. Call the endpoint
	// Note: We need to register the handler to the echo instance or just call the handler function directly
	// Calling directly is easier for unit/integration testing the logic without full routing

	// Since 'completeStudent' is private in 'auth' package, we can't call it if we were in a different package.
	// But we are in 'package auth', so we can access 'completeStudent'.

	c, rec := testutils.CreateEchoContextWithJson(t, e, payload)
	c.SetPath("/auth/:id_user/complete-student/")
	c.SetParamNames("id_user")
	c.SetParamValues(userID)

	err = completeStudent(c)

	// Assertions
	if assert.NoError(t, err) {
		assert.Equal(t, http.StatusAccepted, rec.Code)
		// We could verify the DB state here to ensure 'student' record was created and linked to 'career'
	}
}
