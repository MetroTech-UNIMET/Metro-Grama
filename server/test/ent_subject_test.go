package test

import (
	"context"
	"metrograma/ent"
	"metrograma/ent/subject"
	"testing"

	"entgo.io/ent/dialect"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

func CreateClient() (*ent.Client, context.Context, error) {
	// Create an ent.Client with in-memory SQLite database.
	client, err := ent.Open(dialect.SQLite, "file:ent?mode=memory&cache=shared&_fk=1")
	if err != nil {
		return nil, nil, err
	}
	ctx := context.Background()

	// Run the automatic migration tool to create all schema resources.
	if err := client.Schema.Create(ctx); err != nil {
		return nil, nil, err
	}
	return client, ctx, nil
}

func CreateSubject(ctx context.Context, client *ent.Client, id uuid.UUID, precedesID *uuid.UUID, name string, code string, career string, trimester uint8) (*ent.Subject, error) {
	subject, err := client.Subject.
		Create().
		SetID(id).
		SetNillablePrecedesSubjectID(precedesID).
		SetSubjectName(name).
		SetSubjectCode(code).
		SetCareerName(career).
		SetTrimester(trimester).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return subject, nil
}

func CreateSubjectsData(t *testing.T, ctx context.Context, client *ent.Client) {
	subjectIDs := make([]uuid.UUID, 6)
	for i := 0; i < 6; i++ {
		subjectIDs[i] = uuid.New()
	}

	subjects := []struct {
		ID         uuid.UUID
		PrecedesID *uuid.UUID
		Name       string
		Code       string
		Career     string
		trimester  uint8
	}{
		{
			subjectIDs[0], nil, "Matemática básica", "FBTMM01", "Sistemas", 1,
		},
		{
			subjectIDs[1], &subjectIDs[0], "Matemáticas I", "BPTMI01", "Sistemas", 2,
		},
		{
			subjectIDs[2], &subjectIDs[1], "Matemáticas II", "BPTMI02", "Sistemas", 3,
		},
		{
			subjectIDs[3], &subjectIDs[2], "Matemáticas III", "BPTMI03", "Sistemas", 4,
		},
		{
			subjectIDs[4], &subjectIDs[1], "Física I", "BPTFI01", "Sistemas", 4,
		},
		{
			subjectIDs[5], &subjectIDs[4], "Física II", "BPTFI02", "Sistemas", 5,
		},
	}

	for _, s := range subjects {
		_, err := CreateSubject(ctx, client, s.ID, s.PrecedesID, s.Name, s.Code, s.Career, s.trimester)
		if err != nil {
			t.Error(err)
		}
	}
}

func TestCreateSubject(t *testing.T) {
	client, ctx, err := CreateClient()
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	CreateSubjectsData(t, ctx, client)
}

func TestSubjectByCarrer(t *testing.T) {
	client, ctx, err := CreateClient()
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	CreateSubjectsData(t, ctx, client)
	subjects, err := client.Subject.Query().Where(subject.CareerName("Sistemas")).All(ctx)
	if err != nil {
		t.Error(err)
	}
	if len(subjects) != 6 {
		t.Errorf("The number of subjects must be 6\n")
	}
}
