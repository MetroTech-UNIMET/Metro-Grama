package test

import (
	"context"
	"metrograma/ent"
	careerEnt "metrograma/ent/career"
	"testing"

	"entgo.io/ent/dialect"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

const CareerName = "Ing. Sistemas"

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

func CreateSubject(ctx context.Context, client *ent.Client, id uuid.UUID, precedesID *uuid.UUID, name string, code string, career *ent.Career, trimester uint) (*ent.Subject, error) {
	subject, err := client.Subject.
		Create().
		SetID(id).
		SetNillablePrecedesSubjectID(precedesID).
		SetSubjectName(name).
		SetSubjectCode(code).
		AddCarrer(career).
		SetTrimester(trimester).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return subject, nil
}

func CreateSubjectsData(t *testing.T, ctx context.Context, client *ent.Client, career *ent.Career) error {
	subjectIDs := make([]uuid.UUID, 6)
	for i := 0; i < 6; i++ {
		subjectIDs[i] = uuid.New()
	}

	subjects := []struct {
		ID         uuid.UUID
		PrecedesID *uuid.UUID
		Name       string
		Code       string
		trimester  uint
	}{
		{
			subjectIDs[0], nil, "Matemática básica", "FBTMM01", 1,
		},
		{
			subjectIDs[1], &subjectIDs[0], "Matemáticas I", "BPTMI01", 2,
		},
		{
			subjectIDs[2], &subjectIDs[1], "Matemáticas II", "BPTMI02", 3,
		},
		{
			subjectIDs[3], &subjectIDs[2], "Matemáticas III", "BPTMI03", 4,
		},
		{
			subjectIDs[4], &subjectIDs[1], "Física I", "BPTFI01", 4,
		},
		{
			subjectIDs[5], &subjectIDs[4], "Física II", "BPTFI02", 5,
		},
	}

	for _, s := range subjects {
		_, err := CreateSubject(ctx, client, s.ID, s.PrecedesID, s.Name, s.Code, career, s.trimester)
		if err != nil {
			return err
		}
	}
	return nil
}

func TestCreateCarrer(t *testing.T) {
	client, ctx, err := CreateClient()
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	if _, err := client.Career.Create().SetName(CareerName).Save(ctx); err != nil {
		t.Error(err)
	}
}

func TestGetCarrer(t *testing.T) {
	client, ctx, err := CreateClient()
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	carrer, err := client.Career.Create().SetName(CareerName).Save(ctx)
	if err != nil {
		t.Error(err)
	}

	if _, err := client.Career.Get(ctx, carrer.ID); err != nil {
		t.Error(err)
	}

	if _, err := client.Career.Query().Where(careerEnt.NameEQ(CareerName)).All(ctx); err != nil {
		t.Error(err)
	}
}

func TestCreateSubject(t *testing.T) {
	client, ctx, err := CreateClient()
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	career, err := client.Career.Create().SetName(CareerName).Save(ctx)
	if err != nil {
		t.Error(err)
	}
	if err := CreateSubjectsData(t, ctx, client, career); err != nil {
		t.Error(err)
	}
}

func TestFailCreateSubject(t *testing.T) {
	client, ctx, err := CreateClient()
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	if err != nil {
		t.Error(err)
	}

	_, err = client.Subject.
		Create().
		SetNillablePrecedesSubjectID(nil).
		SetSubjectName("Estructuras de Datos").
		SetSubjectCode("123").
		SetTrimester(3).
		Save(ctx)

	if err == nil {
		t.Error("ERROR. Las materias deben tener un coneccion con por lo menos un grafo de alguna carrera.")
	}
}

func TestSubjectByCarrer(t *testing.T) {
	client, ctx, err := CreateClient()
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	career, err := client.Career.Create().SetName(CareerName).Save(ctx)
	if err != nil {
		t.Error(err)
	}

	CreateSubjectsData(t, ctx, client, career)

	subjects, err := client.Career.Query().Where(careerEnt.Name(CareerName)).QuerySubjects().All(ctx)
	if err != nil {
		t.Error(err)
	}
	if len(subjects) != 6 {
		t.Errorf("The number of subjects must be 6\n")
	}
}
