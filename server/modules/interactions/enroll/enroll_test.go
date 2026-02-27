package enroll

import (
	"context"
	"metrograma/db"
	"metrograma/modules/interactions/enroll/DTO"
	"metrograma/modules/interactions/enroll/services"
	"metrograma/testutils"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func setupEnrollTest(t *testing.T) {
	testutils.SetupEcho()

	// Cleanup
	surrealdb.Query[any](context.Background(), db.SurrealDB, "DELETE student; DELETE subject; DELETE enroll; DELETE precede;", nil)

	// Define function needed for enrollment logic
	query := `
	REMOVE FUNCTION fn::is_subject_enrollable;
	DEFINE FUNCTION fn::is_subject_enrollable($subjectId: record<subject>, $studentId: record<student>, $enrolled: set<record<subject>> ) -> bool | 'already_seen' {
	  LET $is_enrollable = (SELECT VALUE id INSIDE $enrolled 
	    FROM (SELECT VALUE <-precede.in FROM ONLY $subjectId))
	    .all(|$wasEnrolled: any| $wasEnrolled);
	  
	  RETURN IF $subjectId NOTINSIDE $enrolled
	    { $is_enrollable }
	  ELSE
	    { 'already_seen' };
	};`

	_, err := surrealdb.Query[any](context.Background(), db.SurrealDB, query, nil)
	assert.NoError(t, err)
}

func TestEnroll_Prerequisites(t *testing.T) {
	setupEnrollTest(t)

	// 1. Setup Data: Student, Subjects (Math 1 -> Math 2), Trimester
	// Student
	studentID := surrealModels.NewRecordID("student", "enroll_test_student")
	_, err := surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("student"), map[string]any{
		"id": studentID,
	})
	assert.NoError(t, err)

	// Subjects
	math1ID := surrealModels.NewRecordID("subject", "math1")
	math2ID := surrealModels.NewRecordID("subject", "math2")

	_, err = surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("subject"), map[string]any{
		"id":   math1ID,
		"name": "Matemáticas I",
	})
	assert.NoError(t, err)

	_, err = surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("subject"), map[string]any{
		"id":   math2ID,
		"name": "Matemáticas II",
	})
	assert.NoError(t, err)

	// Prelation: Math 1 PRECEDES Math 2
	_, err = surrealdb.Query[any](context.Background(), db.SurrealDB, "RELATE $math1->precede->$math2", map[string]any{
		"math1": math1ID,
		"math2": math2ID,
	})
	assert.NoError(t, err)

	// Trimester
	trimesterID := surrealModels.NewRecordID("trimester", "202520261")
	// (Assuming trimester exists or creating it if needed for foreign key checks, though SurrealDB is loose unless enforced)

	// 2. Try to enroll in Math 2 (Prereq Math 1 not passed)
	input := DTO.CreateEnrolled{
		TrimesterId: trimesterID,
		Grade:       0,
		Difficulty:  0,
		Workload:    0,
	}

	_, err = services.EnrollStudent(studentID, math2ID, input)

	// Expect failure because Math 1 is not passed
	assert.Error(t, err)
	// Optionally check error message contains "no cumple con los requisitos"

	// 3. Pass Math 1
	// We manually create the 'enroll' edge for Math 1
	_, err = surrealdb.Query[any](context.Background(), db.SurrealDB, "RELATE $student->enroll->$subject SET grade = 15", map[string]any{
		"student": studentID,
		"subject": math1ID,
	})
	assert.NoError(t, err)

	// 4. Try to enroll in Math 2 again
	_, err = services.EnrollStudent(studentID, math2ID, input)
	assert.NoError(t, err)
}

func TestMarkAsSeen(t *testing.T) {
	// Req 4: Marcar materia como vista
	// This uses the same service as EnrollStudent but with a passing grade
	setupEnrollTest(t)

	studentID := surrealModels.NewRecordID("student", "seen_test_student")
	subjectID := surrealModels.NewRecordID("subject", "history")

	_, err := surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("student"), map[string]any{
		"id": studentID,
	})
	assert.NoError(t, err)
	_, err = surrealdb.Create[map[string]any](context.Background(), db.SurrealDB, surrealModels.Table("subject"), map[string]any{
		"id":   subjectID,
		"name": "Historia",
	})
	assert.NoError(t, err)

	trimesterID := surrealModels.NewRecordID("trimester", "202520261")

	// Mark as seen (Enroll with grade >= 10, e.g. 15)
	input := DTO.CreateEnrolled{
		TrimesterId: trimesterID,
		Grade:       15,
		Difficulty:  5,
		Workload:    5,
	}

	result, err := services.EnrollStudent(studentID, subjectID, input)
	assert.NoError(t, err)
	assert.Equal(t, 15, result.Grade)

	// Verify in DB
	check, err := surrealdb.Query[[]map[string]any](context.Background(), db.SurrealDB, "SELECT * FROM enroll WHERE in=$student AND out=$subject", map[string]any{
		"student": studentID,
		"subject": subjectID,
	})
	assert.NoError(t, err)
	assert.NotEmpty(t, *check)
	assert.NotEmpty(t, (*check)[0].Result)
}
