// Code generated by ent, DO NOT EDIT.

package subject

import (
	"metrograma/ent/predicate"

	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
	"github.com/google/uuid"
)

// ID filters vertices based on their ID field.
func ID(id uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldID, id))
}

// IDEQ applies the EQ predicate on the ID field.
func IDEQ(id uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldID, id))
}

// IDNEQ applies the NEQ predicate on the ID field.
func IDNEQ(id uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldNEQ(FieldID, id))
}

// IDIn applies the In predicate on the ID field.
func IDIn(ids ...uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldIn(FieldID, ids...))
}

// IDNotIn applies the NotIn predicate on the ID field.
func IDNotIn(ids ...uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldNotIn(FieldID, ids...))
}

// IDGT applies the GT predicate on the ID field.
func IDGT(id uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldGT(FieldID, id))
}

// IDGTE applies the GTE predicate on the ID field.
func IDGTE(id uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldGTE(FieldID, id))
}

// IDLT applies the LT predicate on the ID field.
func IDLT(id uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldLT(FieldID, id))
}

// IDLTE applies the LTE predicate on the ID field.
func IDLTE(id uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldLTE(FieldID, id))
}

// PrecedesSubjectID applies equality check predicate on the "precedes_subject_id" field. It's identical to PrecedesSubjectIDEQ.
func PrecedesSubjectID(v uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldPrecedesSubjectID, v))
}

// SubjectName applies equality check predicate on the "subject_name" field. It's identical to SubjectNameEQ.
func SubjectName(v string) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldSubjectName, v))
}

// SubjectCode applies equality check predicate on the "subject_code" field. It's identical to SubjectCodeEQ.
func SubjectCode(v string) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldSubjectCode, v))
}

// Trimester applies equality check predicate on the "trimester" field. It's identical to TrimesterEQ.
func Trimester(v uint8) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldTrimester, v))
}

// PrecedesSubjectIDEQ applies the EQ predicate on the "precedes_subject_id" field.
func PrecedesSubjectIDEQ(v uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldPrecedesSubjectID, v))
}

// PrecedesSubjectIDNEQ applies the NEQ predicate on the "precedes_subject_id" field.
func PrecedesSubjectIDNEQ(v uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldNEQ(FieldPrecedesSubjectID, v))
}

// PrecedesSubjectIDIn applies the In predicate on the "precedes_subject_id" field.
func PrecedesSubjectIDIn(vs ...uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldIn(FieldPrecedesSubjectID, vs...))
}

// PrecedesSubjectIDNotIn applies the NotIn predicate on the "precedes_subject_id" field.
func PrecedesSubjectIDNotIn(vs ...uuid.UUID) predicate.Subject {
	return predicate.Subject(sql.FieldNotIn(FieldPrecedesSubjectID, vs...))
}

// PrecedesSubjectIDIsNil applies the IsNil predicate on the "precedes_subject_id" field.
func PrecedesSubjectIDIsNil() predicate.Subject {
	return predicate.Subject(sql.FieldIsNull(FieldPrecedesSubjectID))
}

// PrecedesSubjectIDNotNil applies the NotNil predicate on the "precedes_subject_id" field.
func PrecedesSubjectIDNotNil() predicate.Subject {
	return predicate.Subject(sql.FieldNotNull(FieldPrecedesSubjectID))
}

// SubjectNameEQ applies the EQ predicate on the "subject_name" field.
func SubjectNameEQ(v string) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldSubjectName, v))
}

// SubjectNameNEQ applies the NEQ predicate on the "subject_name" field.
func SubjectNameNEQ(v string) predicate.Subject {
	return predicate.Subject(sql.FieldNEQ(FieldSubjectName, v))
}

// SubjectNameIn applies the In predicate on the "subject_name" field.
func SubjectNameIn(vs ...string) predicate.Subject {
	return predicate.Subject(sql.FieldIn(FieldSubjectName, vs...))
}

// SubjectNameNotIn applies the NotIn predicate on the "subject_name" field.
func SubjectNameNotIn(vs ...string) predicate.Subject {
	return predicate.Subject(sql.FieldNotIn(FieldSubjectName, vs...))
}

// SubjectNameGT applies the GT predicate on the "subject_name" field.
func SubjectNameGT(v string) predicate.Subject {
	return predicate.Subject(sql.FieldGT(FieldSubjectName, v))
}

// SubjectNameGTE applies the GTE predicate on the "subject_name" field.
func SubjectNameGTE(v string) predicate.Subject {
	return predicate.Subject(sql.FieldGTE(FieldSubjectName, v))
}

// SubjectNameLT applies the LT predicate on the "subject_name" field.
func SubjectNameLT(v string) predicate.Subject {
	return predicate.Subject(sql.FieldLT(FieldSubjectName, v))
}

// SubjectNameLTE applies the LTE predicate on the "subject_name" field.
func SubjectNameLTE(v string) predicate.Subject {
	return predicate.Subject(sql.FieldLTE(FieldSubjectName, v))
}

// SubjectNameContains applies the Contains predicate on the "subject_name" field.
func SubjectNameContains(v string) predicate.Subject {
	return predicate.Subject(sql.FieldContains(FieldSubjectName, v))
}

// SubjectNameHasPrefix applies the HasPrefix predicate on the "subject_name" field.
func SubjectNameHasPrefix(v string) predicate.Subject {
	return predicate.Subject(sql.FieldHasPrefix(FieldSubjectName, v))
}

// SubjectNameHasSuffix applies the HasSuffix predicate on the "subject_name" field.
func SubjectNameHasSuffix(v string) predicate.Subject {
	return predicate.Subject(sql.FieldHasSuffix(FieldSubjectName, v))
}

// SubjectNameEqualFold applies the EqualFold predicate on the "subject_name" field.
func SubjectNameEqualFold(v string) predicate.Subject {
	return predicate.Subject(sql.FieldEqualFold(FieldSubjectName, v))
}

// SubjectNameContainsFold applies the ContainsFold predicate on the "subject_name" field.
func SubjectNameContainsFold(v string) predicate.Subject {
	return predicate.Subject(sql.FieldContainsFold(FieldSubjectName, v))
}

// SubjectCodeEQ applies the EQ predicate on the "subject_code" field.
func SubjectCodeEQ(v string) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldSubjectCode, v))
}

// SubjectCodeNEQ applies the NEQ predicate on the "subject_code" field.
func SubjectCodeNEQ(v string) predicate.Subject {
	return predicate.Subject(sql.FieldNEQ(FieldSubjectCode, v))
}

// SubjectCodeIn applies the In predicate on the "subject_code" field.
func SubjectCodeIn(vs ...string) predicate.Subject {
	return predicate.Subject(sql.FieldIn(FieldSubjectCode, vs...))
}

// SubjectCodeNotIn applies the NotIn predicate on the "subject_code" field.
func SubjectCodeNotIn(vs ...string) predicate.Subject {
	return predicate.Subject(sql.FieldNotIn(FieldSubjectCode, vs...))
}

// SubjectCodeGT applies the GT predicate on the "subject_code" field.
func SubjectCodeGT(v string) predicate.Subject {
	return predicate.Subject(sql.FieldGT(FieldSubjectCode, v))
}

// SubjectCodeGTE applies the GTE predicate on the "subject_code" field.
func SubjectCodeGTE(v string) predicate.Subject {
	return predicate.Subject(sql.FieldGTE(FieldSubjectCode, v))
}

// SubjectCodeLT applies the LT predicate on the "subject_code" field.
func SubjectCodeLT(v string) predicate.Subject {
	return predicate.Subject(sql.FieldLT(FieldSubjectCode, v))
}

// SubjectCodeLTE applies the LTE predicate on the "subject_code" field.
func SubjectCodeLTE(v string) predicate.Subject {
	return predicate.Subject(sql.FieldLTE(FieldSubjectCode, v))
}

// SubjectCodeContains applies the Contains predicate on the "subject_code" field.
func SubjectCodeContains(v string) predicate.Subject {
	return predicate.Subject(sql.FieldContains(FieldSubjectCode, v))
}

// SubjectCodeHasPrefix applies the HasPrefix predicate on the "subject_code" field.
func SubjectCodeHasPrefix(v string) predicate.Subject {
	return predicate.Subject(sql.FieldHasPrefix(FieldSubjectCode, v))
}

// SubjectCodeHasSuffix applies the HasSuffix predicate on the "subject_code" field.
func SubjectCodeHasSuffix(v string) predicate.Subject {
	return predicate.Subject(sql.FieldHasSuffix(FieldSubjectCode, v))
}

// SubjectCodeEqualFold applies the EqualFold predicate on the "subject_code" field.
func SubjectCodeEqualFold(v string) predicate.Subject {
	return predicate.Subject(sql.FieldEqualFold(FieldSubjectCode, v))
}

// SubjectCodeContainsFold applies the ContainsFold predicate on the "subject_code" field.
func SubjectCodeContainsFold(v string) predicate.Subject {
	return predicate.Subject(sql.FieldContainsFold(FieldSubjectCode, v))
}

// TrimesterEQ applies the EQ predicate on the "trimester" field.
func TrimesterEQ(v uint8) predicate.Subject {
	return predicate.Subject(sql.FieldEQ(FieldTrimester, v))
}

// TrimesterNEQ applies the NEQ predicate on the "trimester" field.
func TrimesterNEQ(v uint8) predicate.Subject {
	return predicate.Subject(sql.FieldNEQ(FieldTrimester, v))
}

// TrimesterIn applies the In predicate on the "trimester" field.
func TrimesterIn(vs ...uint8) predicate.Subject {
	return predicate.Subject(sql.FieldIn(FieldTrimester, vs...))
}

// TrimesterNotIn applies the NotIn predicate on the "trimester" field.
func TrimesterNotIn(vs ...uint8) predicate.Subject {
	return predicate.Subject(sql.FieldNotIn(FieldTrimester, vs...))
}

// TrimesterGT applies the GT predicate on the "trimester" field.
func TrimesterGT(v uint8) predicate.Subject {
	return predicate.Subject(sql.FieldGT(FieldTrimester, v))
}

// TrimesterGTE applies the GTE predicate on the "trimester" field.
func TrimesterGTE(v uint8) predicate.Subject {
	return predicate.Subject(sql.FieldGTE(FieldTrimester, v))
}

// TrimesterLT applies the LT predicate on the "trimester" field.
func TrimesterLT(v uint8) predicate.Subject {
	return predicate.Subject(sql.FieldLT(FieldTrimester, v))
}

// TrimesterLTE applies the LTE predicate on the "trimester" field.
func TrimesterLTE(v uint8) predicate.Subject {
	return predicate.Subject(sql.FieldLTE(FieldTrimester, v))
}

// HasPrecedesSubject applies the HasEdge predicate on the "precedes_subject" edge.
func HasPrecedesSubject() predicate.Subject {
	return predicate.Subject(func(s *sql.Selector) {
		step := sqlgraph.NewStep(
			sqlgraph.From(Table, FieldID),
			sqlgraph.Edge(sqlgraph.M2O, true, PrecedesSubjectTable, PrecedesSubjectColumn),
		)
		sqlgraph.HasNeighbors(s, step)
	})
}

// HasPrecedesSubjectWith applies the HasEdge predicate on the "precedes_subject" edge with a given conditions (other predicates).
func HasPrecedesSubjectWith(preds ...predicate.Subject) predicate.Subject {
	return predicate.Subject(func(s *sql.Selector) {
		step := newPrecedesSubjectStep()
		sqlgraph.HasNeighborsWith(s, step, func(s *sql.Selector) {
			for _, p := range preds {
				p(s)
			}
		})
	})
}

// HasNextSubject applies the HasEdge predicate on the "next_subject" edge.
func HasNextSubject() predicate.Subject {
	return predicate.Subject(func(s *sql.Selector) {
		step := sqlgraph.NewStep(
			sqlgraph.From(Table, FieldID),
			sqlgraph.Edge(sqlgraph.O2M, false, NextSubjectTable, NextSubjectColumn),
		)
		sqlgraph.HasNeighbors(s, step)
	})
}

// HasNextSubjectWith applies the HasEdge predicate on the "next_subject" edge with a given conditions (other predicates).
func HasNextSubjectWith(preds ...predicate.Subject) predicate.Subject {
	return predicate.Subject(func(s *sql.Selector) {
		step := newNextSubjectStep()
		sqlgraph.HasNeighborsWith(s, step, func(s *sql.Selector) {
			for _, p := range preds {
				p(s)
			}
		})
	})
}

// HasCarrer applies the HasEdge predicate on the "carrer" edge.
func HasCarrer() predicate.Subject {
	return predicate.Subject(func(s *sql.Selector) {
		step := sqlgraph.NewStep(
			sqlgraph.From(Table, FieldID),
			sqlgraph.Edge(sqlgraph.M2M, true, CarrerTable, CarrerPrimaryKey...),
		)
		sqlgraph.HasNeighbors(s, step)
	})
}

// HasCarrerWith applies the HasEdge predicate on the "carrer" edge with a given conditions (other predicates).
func HasCarrerWith(preds ...predicate.Career) predicate.Subject {
	return predicate.Subject(func(s *sql.Selector) {
		step := newCarrerStep()
		sqlgraph.HasNeighborsWith(s, step, func(s *sql.Selector) {
			for _, p := range preds {
				p(s)
			}
		})
	})
}

// And groups predicates with the AND operator between them.
func And(predicates ...predicate.Subject) predicate.Subject {
	return predicate.Subject(sql.AndPredicates(predicates...))
}

// Or groups predicates with the OR operator between them.
func Or(predicates ...predicate.Subject) predicate.Subject {
	return predicate.Subject(sql.OrPredicates(predicates...))
}

// Not applies the not operator on the given predicate.
func Not(p predicate.Subject) predicate.Subject {
	return predicate.Subject(sql.NotPredicates(p))
}
