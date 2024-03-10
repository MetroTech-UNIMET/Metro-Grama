// Code generated by ent, DO NOT EDIT.

package ent

import (
	"fmt"
	"metrograma/ent/subject"
	"strings"

	"entgo.io/ent"
	"entgo.io/ent/dialect/sql"
	"github.com/google/uuid"
)

// Subject is the model entity for the Subject schema.
type Subject struct {
	config `json:"-"`
	// ID of the ent.
	ID uuid.UUID `json:"id,omitempty"`
	// SubjectName holds the value of the "subject_name" field.
	SubjectName string `json:"subject_name,omitempty"`
	// SubjectCode holds the value of the "subject_code" field.
	SubjectCode string `json:"subject_code,omitempty"`
	// Trimester holds the value of the "trimester" field.
	Trimester uint `json:"trimester,omitempty"`
	// Edges holds the relations/edges for other nodes in the graph.
	// The values are being populated by the SubjectQuery when eager-loading is set.
	Edges        SubjectEdges `json:"edges"`
	selectValues sql.SelectValues
}

// SubjectEdges holds the relations/edges for other nodes in the graph.
type SubjectEdges struct {
	// PrecedeSubjects holds the value of the precede_subjects edge.
	PrecedeSubjects []*Subject `json:"precede_subjects,omitempty"`
	// NextSubject holds the value of the next_subject edge.
	NextSubject []*Subject `json:"next_subject,omitempty"`
	// Carrer holds the value of the carrer edge.
	Carrer []*Career `json:"carrer,omitempty"`
	// loadedTypes holds the information for reporting if a
	// type was loaded (or requested) in eager-loading or not.
	loadedTypes [3]bool
}

// PrecedeSubjectsOrErr returns the PrecedeSubjects value or an error if the edge
// was not loaded in eager-loading.
func (e SubjectEdges) PrecedeSubjectsOrErr() ([]*Subject, error) {
	if e.loadedTypes[0] {
		return e.PrecedeSubjects, nil
	}
	return nil, &NotLoadedError{edge: "precede_subjects"}
}

// NextSubjectOrErr returns the NextSubject value or an error if the edge
// was not loaded in eager-loading.
func (e SubjectEdges) NextSubjectOrErr() ([]*Subject, error) {
	if e.loadedTypes[1] {
		return e.NextSubject, nil
	}
	return nil, &NotLoadedError{edge: "next_subject"}
}

// CarrerOrErr returns the Carrer value or an error if the edge
// was not loaded in eager-loading.
func (e SubjectEdges) CarrerOrErr() ([]*Career, error) {
	if e.loadedTypes[2] {
		return e.Carrer, nil
	}
	return nil, &NotLoadedError{edge: "carrer"}
}

// scanValues returns the types for scanning values from sql.Rows.
func (*Subject) scanValues(columns []string) ([]any, error) {
	values := make([]any, len(columns))
	for i := range columns {
		switch columns[i] {
		case subject.FieldTrimester:
			values[i] = new(sql.NullInt64)
		case subject.FieldSubjectName, subject.FieldSubjectCode:
			values[i] = new(sql.NullString)
		case subject.FieldID:
			values[i] = new(uuid.UUID)
		default:
			values[i] = new(sql.UnknownType)
		}
	}
	return values, nil
}

// assignValues assigns the values that were returned from sql.Rows (after scanning)
// to the Subject fields.
func (s *Subject) assignValues(columns []string, values []any) error {
	if m, n := len(values), len(columns); m < n {
		return fmt.Errorf("mismatch number of scan values: %d != %d", m, n)
	}
	for i := range columns {
		switch columns[i] {
		case subject.FieldID:
			if value, ok := values[i].(*uuid.UUID); !ok {
				return fmt.Errorf("unexpected type %T for field id", values[i])
			} else if value != nil {
				s.ID = *value
			}
		case subject.FieldSubjectName:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field subject_name", values[i])
			} else if value.Valid {
				s.SubjectName = value.String
			}
		case subject.FieldSubjectCode:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field subject_code", values[i])
			} else if value.Valid {
				s.SubjectCode = value.String
			}
		case subject.FieldTrimester:
			if value, ok := values[i].(*sql.NullInt64); !ok {
				return fmt.Errorf("unexpected type %T for field trimester", values[i])
			} else if value.Valid {
				s.Trimester = uint(value.Int64)
			}
		default:
			s.selectValues.Set(columns[i], values[i])
		}
	}
	return nil
}

// Value returns the ent.Value that was dynamically selected and assigned to the Subject.
// This includes values selected through modifiers, order, etc.
func (s *Subject) Value(name string) (ent.Value, error) {
	return s.selectValues.Get(name)
}

// QueryPrecedeSubjects queries the "precede_subjects" edge of the Subject entity.
func (s *Subject) QueryPrecedeSubjects() *SubjectQuery {
	return NewSubjectClient(s.config).QueryPrecedeSubjects(s)
}

// QueryNextSubject queries the "next_subject" edge of the Subject entity.
func (s *Subject) QueryNextSubject() *SubjectQuery {
	return NewSubjectClient(s.config).QueryNextSubject(s)
}

// QueryCarrer queries the "carrer" edge of the Subject entity.
func (s *Subject) QueryCarrer() *CareerQuery {
	return NewSubjectClient(s.config).QueryCarrer(s)
}

// Update returns a builder for updating this Subject.
// Note that you need to call Subject.Unwrap() before calling this method if this Subject
// was returned from a transaction, and the transaction was committed or rolled back.
func (s *Subject) Update() *SubjectUpdateOne {
	return NewSubjectClient(s.config).UpdateOne(s)
}

// Unwrap unwraps the Subject entity that was returned from a transaction after it was closed,
// so that all future queries will be executed through the driver which created the transaction.
func (s *Subject) Unwrap() *Subject {
	_tx, ok := s.config.driver.(*txDriver)
	if !ok {
		panic("ent: Subject is not a transactional entity")
	}
	s.config.driver = _tx.drv
	return s
}

// String implements the fmt.Stringer.
func (s *Subject) String() string {
	var builder strings.Builder
	builder.WriteString("Subject(")
	builder.WriteString(fmt.Sprintf("id=%v, ", s.ID))
	builder.WriteString("subject_name=")
	builder.WriteString(s.SubjectName)
	builder.WriteString(", ")
	builder.WriteString("subject_code=")
	builder.WriteString(s.SubjectCode)
	builder.WriteString(", ")
	builder.WriteString("trimester=")
	builder.WriteString(fmt.Sprintf("%v", s.Trimester))
	builder.WriteByte(')')
	return builder.String()
}

// Subjects is a parsable slice of Subject.
type Subjects []*Subject
