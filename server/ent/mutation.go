// Code generated by ent, DO NOT EDIT.

package ent

import (
	"context"
	"errors"
	"fmt"
	"metrograma/ent/career"
	"metrograma/ent/predicate"
	"metrograma/ent/subject"
	"sync"

	"entgo.io/ent"
	"entgo.io/ent/dialect/sql"
	"github.com/google/uuid"
)

const (
	// Operation types.
	OpCreate    = ent.OpCreate
	OpDelete    = ent.OpDelete
	OpDeleteOne = ent.OpDeleteOne
	OpUpdate    = ent.OpUpdate
	OpUpdateOne = ent.OpUpdateOne

	// Node types.
	TypeCareer  = "Career"
	TypeSubject = "Subject"
)

// CareerMutation represents an operation that mutates the Career nodes in the graph.
type CareerMutation struct {
	config
	op              Op
	typ             string
	id              *uuid.UUID
	name            *string
	clearedFields   map[string]struct{}
	subjects        map[uuid.UUID]struct{}
	removedsubjects map[uuid.UUID]struct{}
	clearedsubjects bool
	done            bool
	oldValue        func(context.Context) (*Career, error)
	predicates      []predicate.Career
}

var _ ent.Mutation = (*CareerMutation)(nil)

// careerOption allows management of the mutation configuration using functional options.
type careerOption func(*CareerMutation)

// newCareerMutation creates new mutation for the Career entity.
func newCareerMutation(c config, op Op, opts ...careerOption) *CareerMutation {
	m := &CareerMutation{
		config:        c,
		op:            op,
		typ:           TypeCareer,
		clearedFields: make(map[string]struct{}),
	}
	for _, opt := range opts {
		opt(m)
	}
	return m
}

// withCareerID sets the ID field of the mutation.
func withCareerID(id uuid.UUID) careerOption {
	return func(m *CareerMutation) {
		var (
			err   error
			once  sync.Once
			value *Career
		)
		m.oldValue = func(ctx context.Context) (*Career, error) {
			once.Do(func() {
				if m.done {
					err = errors.New("querying old values post mutation is not allowed")
				} else {
					value, err = m.Client().Career.Get(ctx, id)
				}
			})
			return value, err
		}
		m.id = &id
	}
}

// withCareer sets the old Career of the mutation.
func withCareer(node *Career) careerOption {
	return func(m *CareerMutation) {
		m.oldValue = func(context.Context) (*Career, error) {
			return node, nil
		}
		m.id = &node.ID
	}
}

// Client returns a new `ent.Client` from the mutation. If the mutation was
// executed in a transaction (ent.Tx), a transactional client is returned.
func (m CareerMutation) Client() *Client {
	client := &Client{config: m.config}
	client.init()
	return client
}

// Tx returns an `ent.Tx` for mutations that were executed in transactions;
// it returns an error otherwise.
func (m CareerMutation) Tx() (*Tx, error) {
	if _, ok := m.driver.(*txDriver); !ok {
		return nil, errors.New("ent: mutation is not running in a transaction")
	}
	tx := &Tx{config: m.config}
	tx.init()
	return tx, nil
}

// SetID sets the value of the id field. Note that this
// operation is only accepted on creation of Career entities.
func (m *CareerMutation) SetID(id uuid.UUID) {
	m.id = &id
}

// ID returns the ID value in the mutation. Note that the ID is only available
// if it was provided to the builder or after it was returned from the database.
func (m *CareerMutation) ID() (id uuid.UUID, exists bool) {
	if m.id == nil {
		return
	}
	return *m.id, true
}

// IDs queries the database and returns the entity ids that match the mutation's predicate.
// That means, if the mutation is applied within a transaction with an isolation level such
// as sql.LevelSerializable, the returned ids match the ids of the rows that will be updated
// or updated by the mutation.
func (m *CareerMutation) IDs(ctx context.Context) ([]uuid.UUID, error) {
	switch {
	case m.op.Is(OpUpdateOne | OpDeleteOne):
		id, exists := m.ID()
		if exists {
			return []uuid.UUID{id}, nil
		}
		fallthrough
	case m.op.Is(OpUpdate | OpDelete):
		return m.Client().Career.Query().Where(m.predicates...).IDs(ctx)
	default:
		return nil, fmt.Errorf("IDs is not allowed on %s operations", m.op)
	}
}

// SetName sets the "name" field.
func (m *CareerMutation) SetName(s string) {
	m.name = &s
}

// Name returns the value of the "name" field in the mutation.
func (m *CareerMutation) Name() (r string, exists bool) {
	v := m.name
	if v == nil {
		return
	}
	return *v, true
}

// OldName returns the old "name" field's value of the Career entity.
// If the Career object wasn't provided to the builder, the object is fetched from the database.
// An error is returned if the mutation operation is not UpdateOne, or the database query fails.
func (m *CareerMutation) OldName(ctx context.Context) (v string, err error) {
	if !m.op.Is(OpUpdateOne) {
		return v, errors.New("OldName is only allowed on UpdateOne operations")
	}
	if m.id == nil || m.oldValue == nil {
		return v, errors.New("OldName requires an ID field in the mutation")
	}
	oldValue, err := m.oldValue(ctx)
	if err != nil {
		return v, fmt.Errorf("querying old value for OldName: %w", err)
	}
	return oldValue.Name, nil
}

// ResetName resets all changes to the "name" field.
func (m *CareerMutation) ResetName() {
	m.name = nil
}

// AddSubjectIDs adds the "subjects" edge to the Subject entity by ids.
func (m *CareerMutation) AddSubjectIDs(ids ...uuid.UUID) {
	if m.subjects == nil {
		m.subjects = make(map[uuid.UUID]struct{})
	}
	for i := range ids {
		m.subjects[ids[i]] = struct{}{}
	}
}

// ClearSubjects clears the "subjects" edge to the Subject entity.
func (m *CareerMutation) ClearSubjects() {
	m.clearedsubjects = true
}

// SubjectsCleared reports if the "subjects" edge to the Subject entity was cleared.
func (m *CareerMutation) SubjectsCleared() bool {
	return m.clearedsubjects
}

// RemoveSubjectIDs removes the "subjects" edge to the Subject entity by IDs.
func (m *CareerMutation) RemoveSubjectIDs(ids ...uuid.UUID) {
	if m.removedsubjects == nil {
		m.removedsubjects = make(map[uuid.UUID]struct{})
	}
	for i := range ids {
		delete(m.subjects, ids[i])
		m.removedsubjects[ids[i]] = struct{}{}
	}
}

// RemovedSubjects returns the removed IDs of the "subjects" edge to the Subject entity.
func (m *CareerMutation) RemovedSubjectsIDs() (ids []uuid.UUID) {
	for id := range m.removedsubjects {
		ids = append(ids, id)
	}
	return
}

// SubjectsIDs returns the "subjects" edge IDs in the mutation.
func (m *CareerMutation) SubjectsIDs() (ids []uuid.UUID) {
	for id := range m.subjects {
		ids = append(ids, id)
	}
	return
}

// ResetSubjects resets all changes to the "subjects" edge.
func (m *CareerMutation) ResetSubjects() {
	m.subjects = nil
	m.clearedsubjects = false
	m.removedsubjects = nil
}

// Where appends a list predicates to the CareerMutation builder.
func (m *CareerMutation) Where(ps ...predicate.Career) {
	m.predicates = append(m.predicates, ps...)
}

// WhereP appends storage-level predicates to the CareerMutation builder. Using this method,
// users can use type-assertion to append predicates that do not depend on any generated package.
func (m *CareerMutation) WhereP(ps ...func(*sql.Selector)) {
	p := make([]predicate.Career, len(ps))
	for i := range ps {
		p[i] = ps[i]
	}
	m.Where(p...)
}

// Op returns the operation name.
func (m *CareerMutation) Op() Op {
	return m.op
}

// SetOp allows setting the mutation operation.
func (m *CareerMutation) SetOp(op Op) {
	m.op = op
}

// Type returns the node type of this mutation (Career).
func (m *CareerMutation) Type() string {
	return m.typ
}

// Fields returns all fields that were changed during this mutation. Note that in
// order to get all numeric fields that were incremented/decremented, call
// AddedFields().
func (m *CareerMutation) Fields() []string {
	fields := make([]string, 0, 1)
	if m.name != nil {
		fields = append(fields, career.FieldName)
	}
	return fields
}

// Field returns the value of a field with the given name. The second boolean
// return value indicates that this field was not set, or was not defined in the
// schema.
func (m *CareerMutation) Field(name string) (ent.Value, bool) {
	switch name {
	case career.FieldName:
		return m.Name()
	}
	return nil, false
}

// OldField returns the old value of the field from the database. An error is
// returned if the mutation operation is not UpdateOne, or the query to the
// database failed.
func (m *CareerMutation) OldField(ctx context.Context, name string) (ent.Value, error) {
	switch name {
	case career.FieldName:
		return m.OldName(ctx)
	}
	return nil, fmt.Errorf("unknown Career field %s", name)
}

// SetField sets the value of a field with the given name. It returns an error if
// the field is not defined in the schema, or if the type mismatched the field
// type.
func (m *CareerMutation) SetField(name string, value ent.Value) error {
	switch name {
	case career.FieldName:
		v, ok := value.(string)
		if !ok {
			return fmt.Errorf("unexpected type %T for field %s", value, name)
		}
		m.SetName(v)
		return nil
	}
	return fmt.Errorf("unknown Career field %s", name)
}

// AddedFields returns all numeric fields that were incremented/decremented during
// this mutation.
func (m *CareerMutation) AddedFields() []string {
	return nil
}

// AddedField returns the numeric value that was incremented/decremented on a field
// with the given name. The second boolean return value indicates that this field
// was not set, or was not defined in the schema.
func (m *CareerMutation) AddedField(name string) (ent.Value, bool) {
	return nil, false
}

// AddField adds the value to the field with the given name. It returns an error if
// the field is not defined in the schema, or if the type mismatched the field
// type.
func (m *CareerMutation) AddField(name string, value ent.Value) error {
	switch name {
	}
	return fmt.Errorf("unknown Career numeric field %s", name)
}

// ClearedFields returns all nullable fields that were cleared during this
// mutation.
func (m *CareerMutation) ClearedFields() []string {
	return nil
}

// FieldCleared returns a boolean indicating if a field with the given name was
// cleared in this mutation.
func (m *CareerMutation) FieldCleared(name string) bool {
	_, ok := m.clearedFields[name]
	return ok
}

// ClearField clears the value of the field with the given name. It returns an
// error if the field is not defined in the schema.
func (m *CareerMutation) ClearField(name string) error {
	return fmt.Errorf("unknown Career nullable field %s", name)
}

// ResetField resets all changes in the mutation for the field with the given name.
// It returns an error if the field is not defined in the schema.
func (m *CareerMutation) ResetField(name string) error {
	switch name {
	case career.FieldName:
		m.ResetName()
		return nil
	}
	return fmt.Errorf("unknown Career field %s", name)
}

// AddedEdges returns all edge names that were set/added in this mutation.
func (m *CareerMutation) AddedEdges() []string {
	edges := make([]string, 0, 1)
	if m.subjects != nil {
		edges = append(edges, career.EdgeSubjects)
	}
	return edges
}

// AddedIDs returns all IDs (to other nodes) that were added for the given edge
// name in this mutation.
func (m *CareerMutation) AddedIDs(name string) []ent.Value {
	switch name {
	case career.EdgeSubjects:
		ids := make([]ent.Value, 0, len(m.subjects))
		for id := range m.subjects {
			ids = append(ids, id)
		}
		return ids
	}
	return nil
}

// RemovedEdges returns all edge names that were removed in this mutation.
func (m *CareerMutation) RemovedEdges() []string {
	edges := make([]string, 0, 1)
	if m.removedsubjects != nil {
		edges = append(edges, career.EdgeSubjects)
	}
	return edges
}

// RemovedIDs returns all IDs (to other nodes) that were removed for the edge with
// the given name in this mutation.
func (m *CareerMutation) RemovedIDs(name string) []ent.Value {
	switch name {
	case career.EdgeSubjects:
		ids := make([]ent.Value, 0, len(m.removedsubjects))
		for id := range m.removedsubjects {
			ids = append(ids, id)
		}
		return ids
	}
	return nil
}

// ClearedEdges returns all edge names that were cleared in this mutation.
func (m *CareerMutation) ClearedEdges() []string {
	edges := make([]string, 0, 1)
	if m.clearedsubjects {
		edges = append(edges, career.EdgeSubjects)
	}
	return edges
}

// EdgeCleared returns a boolean which indicates if the edge with the given name
// was cleared in this mutation.
func (m *CareerMutation) EdgeCleared(name string) bool {
	switch name {
	case career.EdgeSubjects:
		return m.clearedsubjects
	}
	return false
}

// ClearEdge clears the value of the edge with the given name. It returns an error
// if that edge is not defined in the schema.
func (m *CareerMutation) ClearEdge(name string) error {
	switch name {
	}
	return fmt.Errorf("unknown Career unique edge %s", name)
}

// ResetEdge resets all changes to the edge with the given name in this mutation.
// It returns an error if the edge is not defined in the schema.
func (m *CareerMutation) ResetEdge(name string) error {
	switch name {
	case career.EdgeSubjects:
		m.ResetSubjects()
		return nil
	}
	return fmt.Errorf("unknown Career edge %s", name)
}

// SubjectMutation represents an operation that mutates the Subject nodes in the graph.
type SubjectMutation struct {
	config
	op                      Op
	typ                     string
	id                      *uuid.UUID
	subject_name            *string
	subject_code            *string
	trimester               *uint
	addtrimester            *int
	clearedFields           map[string]struct{}
	precedes_subject        *uuid.UUID
	clearedprecedes_subject bool
	next_subject            map[uuid.UUID]struct{}
	removednext_subject     map[uuid.UUID]struct{}
	clearednext_subject     bool
	carrer                  map[uuid.UUID]struct{}
	removedcarrer           map[uuid.UUID]struct{}
	clearedcarrer           bool
	done                    bool
	oldValue                func(context.Context) (*Subject, error)
	predicates              []predicate.Subject
}

var _ ent.Mutation = (*SubjectMutation)(nil)

// subjectOption allows management of the mutation configuration using functional options.
type subjectOption func(*SubjectMutation)

// newSubjectMutation creates new mutation for the Subject entity.
func newSubjectMutation(c config, op Op, opts ...subjectOption) *SubjectMutation {
	m := &SubjectMutation{
		config:        c,
		op:            op,
		typ:           TypeSubject,
		clearedFields: make(map[string]struct{}),
	}
	for _, opt := range opts {
		opt(m)
	}
	return m
}

// withSubjectID sets the ID field of the mutation.
func withSubjectID(id uuid.UUID) subjectOption {
	return func(m *SubjectMutation) {
		var (
			err   error
			once  sync.Once
			value *Subject
		)
		m.oldValue = func(ctx context.Context) (*Subject, error) {
			once.Do(func() {
				if m.done {
					err = errors.New("querying old values post mutation is not allowed")
				} else {
					value, err = m.Client().Subject.Get(ctx, id)
				}
			})
			return value, err
		}
		m.id = &id
	}
}

// withSubject sets the old Subject of the mutation.
func withSubject(node *Subject) subjectOption {
	return func(m *SubjectMutation) {
		m.oldValue = func(context.Context) (*Subject, error) {
			return node, nil
		}
		m.id = &node.ID
	}
}

// Client returns a new `ent.Client` from the mutation. If the mutation was
// executed in a transaction (ent.Tx), a transactional client is returned.
func (m SubjectMutation) Client() *Client {
	client := &Client{config: m.config}
	client.init()
	return client
}

// Tx returns an `ent.Tx` for mutations that were executed in transactions;
// it returns an error otherwise.
func (m SubjectMutation) Tx() (*Tx, error) {
	if _, ok := m.driver.(*txDriver); !ok {
		return nil, errors.New("ent: mutation is not running in a transaction")
	}
	tx := &Tx{config: m.config}
	tx.init()
	return tx, nil
}

// SetID sets the value of the id field. Note that this
// operation is only accepted on creation of Subject entities.
func (m *SubjectMutation) SetID(id uuid.UUID) {
	m.id = &id
}

// ID returns the ID value in the mutation. Note that the ID is only available
// if it was provided to the builder or after it was returned from the database.
func (m *SubjectMutation) ID() (id uuid.UUID, exists bool) {
	if m.id == nil {
		return
	}
	return *m.id, true
}

// IDs queries the database and returns the entity ids that match the mutation's predicate.
// That means, if the mutation is applied within a transaction with an isolation level such
// as sql.LevelSerializable, the returned ids match the ids of the rows that will be updated
// or updated by the mutation.
func (m *SubjectMutation) IDs(ctx context.Context) ([]uuid.UUID, error) {
	switch {
	case m.op.Is(OpUpdateOne | OpDeleteOne):
		id, exists := m.ID()
		if exists {
			return []uuid.UUID{id}, nil
		}
		fallthrough
	case m.op.Is(OpUpdate | OpDelete):
		return m.Client().Subject.Query().Where(m.predicates...).IDs(ctx)
	default:
		return nil, fmt.Errorf("IDs is not allowed on %s operations", m.op)
	}
}

// SetPrecedesSubjectID sets the "precedes_subject_id" field.
func (m *SubjectMutation) SetPrecedesSubjectID(u uuid.UUID) {
	m.precedes_subject = &u
}

// PrecedesSubjectID returns the value of the "precedes_subject_id" field in the mutation.
func (m *SubjectMutation) PrecedesSubjectID() (r uuid.UUID, exists bool) {
	v := m.precedes_subject
	if v == nil {
		return
	}
	return *v, true
}

// OldPrecedesSubjectID returns the old "precedes_subject_id" field's value of the Subject entity.
// If the Subject object wasn't provided to the builder, the object is fetched from the database.
// An error is returned if the mutation operation is not UpdateOne, or the database query fails.
func (m *SubjectMutation) OldPrecedesSubjectID(ctx context.Context) (v *uuid.UUID, err error) {
	if !m.op.Is(OpUpdateOne) {
		return v, errors.New("OldPrecedesSubjectID is only allowed on UpdateOne operations")
	}
	if m.id == nil || m.oldValue == nil {
		return v, errors.New("OldPrecedesSubjectID requires an ID field in the mutation")
	}
	oldValue, err := m.oldValue(ctx)
	if err != nil {
		return v, fmt.Errorf("querying old value for OldPrecedesSubjectID: %w", err)
	}
	return oldValue.PrecedesSubjectID, nil
}

// ClearPrecedesSubjectID clears the value of the "precedes_subject_id" field.
func (m *SubjectMutation) ClearPrecedesSubjectID() {
	m.precedes_subject = nil
	m.clearedFields[subject.FieldPrecedesSubjectID] = struct{}{}
}

// PrecedesSubjectIDCleared returns if the "precedes_subject_id" field was cleared in this mutation.
func (m *SubjectMutation) PrecedesSubjectIDCleared() bool {
	_, ok := m.clearedFields[subject.FieldPrecedesSubjectID]
	return ok
}

// ResetPrecedesSubjectID resets all changes to the "precedes_subject_id" field.
func (m *SubjectMutation) ResetPrecedesSubjectID() {
	m.precedes_subject = nil
	delete(m.clearedFields, subject.FieldPrecedesSubjectID)
}

// SetSubjectName sets the "subject_name" field.
func (m *SubjectMutation) SetSubjectName(s string) {
	m.subject_name = &s
}

// SubjectName returns the value of the "subject_name" field in the mutation.
func (m *SubjectMutation) SubjectName() (r string, exists bool) {
	v := m.subject_name
	if v == nil {
		return
	}
	return *v, true
}

// OldSubjectName returns the old "subject_name" field's value of the Subject entity.
// If the Subject object wasn't provided to the builder, the object is fetched from the database.
// An error is returned if the mutation operation is not UpdateOne, or the database query fails.
func (m *SubjectMutation) OldSubjectName(ctx context.Context) (v string, err error) {
	if !m.op.Is(OpUpdateOne) {
		return v, errors.New("OldSubjectName is only allowed on UpdateOne operations")
	}
	if m.id == nil || m.oldValue == nil {
		return v, errors.New("OldSubjectName requires an ID field in the mutation")
	}
	oldValue, err := m.oldValue(ctx)
	if err != nil {
		return v, fmt.Errorf("querying old value for OldSubjectName: %w", err)
	}
	return oldValue.SubjectName, nil
}

// ResetSubjectName resets all changes to the "subject_name" field.
func (m *SubjectMutation) ResetSubjectName() {
	m.subject_name = nil
}

// SetSubjectCode sets the "subject_code" field.
func (m *SubjectMutation) SetSubjectCode(s string) {
	m.subject_code = &s
}

// SubjectCode returns the value of the "subject_code" field in the mutation.
func (m *SubjectMutation) SubjectCode() (r string, exists bool) {
	v := m.subject_code
	if v == nil {
		return
	}
	return *v, true
}

// OldSubjectCode returns the old "subject_code" field's value of the Subject entity.
// If the Subject object wasn't provided to the builder, the object is fetched from the database.
// An error is returned if the mutation operation is not UpdateOne, or the database query fails.
func (m *SubjectMutation) OldSubjectCode(ctx context.Context) (v string, err error) {
	if !m.op.Is(OpUpdateOne) {
		return v, errors.New("OldSubjectCode is only allowed on UpdateOne operations")
	}
	if m.id == nil || m.oldValue == nil {
		return v, errors.New("OldSubjectCode requires an ID field in the mutation")
	}
	oldValue, err := m.oldValue(ctx)
	if err != nil {
		return v, fmt.Errorf("querying old value for OldSubjectCode: %w", err)
	}
	return oldValue.SubjectCode, nil
}

// ResetSubjectCode resets all changes to the "subject_code" field.
func (m *SubjectMutation) ResetSubjectCode() {
	m.subject_code = nil
}

// SetTrimester sets the "trimester" field.
func (m *SubjectMutation) SetTrimester(u uint) {
	m.trimester = &u
	m.addtrimester = nil
}

// Trimester returns the value of the "trimester" field in the mutation.
func (m *SubjectMutation) Trimester() (r uint, exists bool) {
	v := m.trimester
	if v == nil {
		return
	}
	return *v, true
}

// OldTrimester returns the old "trimester" field's value of the Subject entity.
// If the Subject object wasn't provided to the builder, the object is fetched from the database.
// An error is returned if the mutation operation is not UpdateOne, or the database query fails.
func (m *SubjectMutation) OldTrimester(ctx context.Context) (v uint, err error) {
	if !m.op.Is(OpUpdateOne) {
		return v, errors.New("OldTrimester is only allowed on UpdateOne operations")
	}
	if m.id == nil || m.oldValue == nil {
		return v, errors.New("OldTrimester requires an ID field in the mutation")
	}
	oldValue, err := m.oldValue(ctx)
	if err != nil {
		return v, fmt.Errorf("querying old value for OldTrimester: %w", err)
	}
	return oldValue.Trimester, nil
}

// AddTrimester adds u to the "trimester" field.
func (m *SubjectMutation) AddTrimester(u int) {
	if m.addtrimester != nil {
		*m.addtrimester += u
	} else {
		m.addtrimester = &u
	}
}

// AddedTrimester returns the value that was added to the "trimester" field in this mutation.
func (m *SubjectMutation) AddedTrimester() (r int, exists bool) {
	v := m.addtrimester
	if v == nil {
		return
	}
	return *v, true
}

// ResetTrimester resets all changes to the "trimester" field.
func (m *SubjectMutation) ResetTrimester() {
	m.trimester = nil
	m.addtrimester = nil
}

// ClearPrecedesSubject clears the "precedes_subject" edge to the Subject entity.
func (m *SubjectMutation) ClearPrecedesSubject() {
	m.clearedprecedes_subject = true
	m.clearedFields[subject.FieldPrecedesSubjectID] = struct{}{}
}

// PrecedesSubjectCleared reports if the "precedes_subject" edge to the Subject entity was cleared.
func (m *SubjectMutation) PrecedesSubjectCleared() bool {
	return m.PrecedesSubjectIDCleared() || m.clearedprecedes_subject
}

// PrecedesSubjectIDs returns the "precedes_subject" edge IDs in the mutation.
// Note that IDs always returns len(IDs) <= 1 for unique edges, and you should use
// PrecedesSubjectID instead. It exists only for internal usage by the builders.
func (m *SubjectMutation) PrecedesSubjectIDs() (ids []uuid.UUID) {
	if id := m.precedes_subject; id != nil {
		ids = append(ids, *id)
	}
	return
}

// ResetPrecedesSubject resets all changes to the "precedes_subject" edge.
func (m *SubjectMutation) ResetPrecedesSubject() {
	m.precedes_subject = nil
	m.clearedprecedes_subject = false
}

// AddNextSubjectIDs adds the "next_subject" edge to the Subject entity by ids.
func (m *SubjectMutation) AddNextSubjectIDs(ids ...uuid.UUID) {
	if m.next_subject == nil {
		m.next_subject = make(map[uuid.UUID]struct{})
	}
	for i := range ids {
		m.next_subject[ids[i]] = struct{}{}
	}
}

// ClearNextSubject clears the "next_subject" edge to the Subject entity.
func (m *SubjectMutation) ClearNextSubject() {
	m.clearednext_subject = true
}

// NextSubjectCleared reports if the "next_subject" edge to the Subject entity was cleared.
func (m *SubjectMutation) NextSubjectCleared() bool {
	return m.clearednext_subject
}

// RemoveNextSubjectIDs removes the "next_subject" edge to the Subject entity by IDs.
func (m *SubjectMutation) RemoveNextSubjectIDs(ids ...uuid.UUID) {
	if m.removednext_subject == nil {
		m.removednext_subject = make(map[uuid.UUID]struct{})
	}
	for i := range ids {
		delete(m.next_subject, ids[i])
		m.removednext_subject[ids[i]] = struct{}{}
	}
}

// RemovedNextSubject returns the removed IDs of the "next_subject" edge to the Subject entity.
func (m *SubjectMutation) RemovedNextSubjectIDs() (ids []uuid.UUID) {
	for id := range m.removednext_subject {
		ids = append(ids, id)
	}
	return
}

// NextSubjectIDs returns the "next_subject" edge IDs in the mutation.
func (m *SubjectMutation) NextSubjectIDs() (ids []uuid.UUID) {
	for id := range m.next_subject {
		ids = append(ids, id)
	}
	return
}

// ResetNextSubject resets all changes to the "next_subject" edge.
func (m *SubjectMutation) ResetNextSubject() {
	m.next_subject = nil
	m.clearednext_subject = false
	m.removednext_subject = nil
}

// AddCarrerIDs adds the "carrer" edge to the Career entity by ids.
func (m *SubjectMutation) AddCarrerIDs(ids ...uuid.UUID) {
	if m.carrer == nil {
		m.carrer = make(map[uuid.UUID]struct{})
	}
	for i := range ids {
		m.carrer[ids[i]] = struct{}{}
	}
}

// ClearCarrer clears the "carrer" edge to the Career entity.
func (m *SubjectMutation) ClearCarrer() {
	m.clearedcarrer = true
}

// CarrerCleared reports if the "carrer" edge to the Career entity was cleared.
func (m *SubjectMutation) CarrerCleared() bool {
	return m.clearedcarrer
}

// RemoveCarrerIDs removes the "carrer" edge to the Career entity by IDs.
func (m *SubjectMutation) RemoveCarrerIDs(ids ...uuid.UUID) {
	if m.removedcarrer == nil {
		m.removedcarrer = make(map[uuid.UUID]struct{})
	}
	for i := range ids {
		delete(m.carrer, ids[i])
		m.removedcarrer[ids[i]] = struct{}{}
	}
}

// RemovedCarrer returns the removed IDs of the "carrer" edge to the Career entity.
func (m *SubjectMutation) RemovedCarrerIDs() (ids []uuid.UUID) {
	for id := range m.removedcarrer {
		ids = append(ids, id)
	}
	return
}

// CarrerIDs returns the "carrer" edge IDs in the mutation.
func (m *SubjectMutation) CarrerIDs() (ids []uuid.UUID) {
	for id := range m.carrer {
		ids = append(ids, id)
	}
	return
}

// ResetCarrer resets all changes to the "carrer" edge.
func (m *SubjectMutation) ResetCarrer() {
	m.carrer = nil
	m.clearedcarrer = false
	m.removedcarrer = nil
}

// Where appends a list predicates to the SubjectMutation builder.
func (m *SubjectMutation) Where(ps ...predicate.Subject) {
	m.predicates = append(m.predicates, ps...)
}

// WhereP appends storage-level predicates to the SubjectMutation builder. Using this method,
// users can use type-assertion to append predicates that do not depend on any generated package.
func (m *SubjectMutation) WhereP(ps ...func(*sql.Selector)) {
	p := make([]predicate.Subject, len(ps))
	for i := range ps {
		p[i] = ps[i]
	}
	m.Where(p...)
}

// Op returns the operation name.
func (m *SubjectMutation) Op() Op {
	return m.op
}

// SetOp allows setting the mutation operation.
func (m *SubjectMutation) SetOp(op Op) {
	m.op = op
}

// Type returns the node type of this mutation (Subject).
func (m *SubjectMutation) Type() string {
	return m.typ
}

// Fields returns all fields that were changed during this mutation. Note that in
// order to get all numeric fields that were incremented/decremented, call
// AddedFields().
func (m *SubjectMutation) Fields() []string {
	fields := make([]string, 0, 4)
	if m.precedes_subject != nil {
		fields = append(fields, subject.FieldPrecedesSubjectID)
	}
	if m.subject_name != nil {
		fields = append(fields, subject.FieldSubjectName)
	}
	if m.subject_code != nil {
		fields = append(fields, subject.FieldSubjectCode)
	}
	if m.trimester != nil {
		fields = append(fields, subject.FieldTrimester)
	}
	return fields
}

// Field returns the value of a field with the given name. The second boolean
// return value indicates that this field was not set, or was not defined in the
// schema.
func (m *SubjectMutation) Field(name string) (ent.Value, bool) {
	switch name {
	case subject.FieldPrecedesSubjectID:
		return m.PrecedesSubjectID()
	case subject.FieldSubjectName:
		return m.SubjectName()
	case subject.FieldSubjectCode:
		return m.SubjectCode()
	case subject.FieldTrimester:
		return m.Trimester()
	}
	return nil, false
}

// OldField returns the old value of the field from the database. An error is
// returned if the mutation operation is not UpdateOne, or the query to the
// database failed.
func (m *SubjectMutation) OldField(ctx context.Context, name string) (ent.Value, error) {
	switch name {
	case subject.FieldPrecedesSubjectID:
		return m.OldPrecedesSubjectID(ctx)
	case subject.FieldSubjectName:
		return m.OldSubjectName(ctx)
	case subject.FieldSubjectCode:
		return m.OldSubjectCode(ctx)
	case subject.FieldTrimester:
		return m.OldTrimester(ctx)
	}
	return nil, fmt.Errorf("unknown Subject field %s", name)
}

// SetField sets the value of a field with the given name. It returns an error if
// the field is not defined in the schema, or if the type mismatched the field
// type.
func (m *SubjectMutation) SetField(name string, value ent.Value) error {
	switch name {
	case subject.FieldPrecedesSubjectID:
		v, ok := value.(uuid.UUID)
		if !ok {
			return fmt.Errorf("unexpected type %T for field %s", value, name)
		}
		m.SetPrecedesSubjectID(v)
		return nil
	case subject.FieldSubjectName:
		v, ok := value.(string)
		if !ok {
			return fmt.Errorf("unexpected type %T for field %s", value, name)
		}
		m.SetSubjectName(v)
		return nil
	case subject.FieldSubjectCode:
		v, ok := value.(string)
		if !ok {
			return fmt.Errorf("unexpected type %T for field %s", value, name)
		}
		m.SetSubjectCode(v)
		return nil
	case subject.FieldTrimester:
		v, ok := value.(uint)
		if !ok {
			return fmt.Errorf("unexpected type %T for field %s", value, name)
		}
		m.SetTrimester(v)
		return nil
	}
	return fmt.Errorf("unknown Subject field %s", name)
}

// AddedFields returns all numeric fields that were incremented/decremented during
// this mutation.
func (m *SubjectMutation) AddedFields() []string {
	var fields []string
	if m.addtrimester != nil {
		fields = append(fields, subject.FieldTrimester)
	}
	return fields
}

// AddedField returns the numeric value that was incremented/decremented on a field
// with the given name. The second boolean return value indicates that this field
// was not set, or was not defined in the schema.
func (m *SubjectMutation) AddedField(name string) (ent.Value, bool) {
	switch name {
	case subject.FieldTrimester:
		return m.AddedTrimester()
	}
	return nil, false
}

// AddField adds the value to the field with the given name. It returns an error if
// the field is not defined in the schema, or if the type mismatched the field
// type.
func (m *SubjectMutation) AddField(name string, value ent.Value) error {
	switch name {
	case subject.FieldTrimester:
		v, ok := value.(int)
		if !ok {
			return fmt.Errorf("unexpected type %T for field %s", value, name)
		}
		m.AddTrimester(v)
		return nil
	}
	return fmt.Errorf("unknown Subject numeric field %s", name)
}

// ClearedFields returns all nullable fields that were cleared during this
// mutation.
func (m *SubjectMutation) ClearedFields() []string {
	var fields []string
	if m.FieldCleared(subject.FieldPrecedesSubjectID) {
		fields = append(fields, subject.FieldPrecedesSubjectID)
	}
	return fields
}

// FieldCleared returns a boolean indicating if a field with the given name was
// cleared in this mutation.
func (m *SubjectMutation) FieldCleared(name string) bool {
	_, ok := m.clearedFields[name]
	return ok
}

// ClearField clears the value of the field with the given name. It returns an
// error if the field is not defined in the schema.
func (m *SubjectMutation) ClearField(name string) error {
	switch name {
	case subject.FieldPrecedesSubjectID:
		m.ClearPrecedesSubjectID()
		return nil
	}
	return fmt.Errorf("unknown Subject nullable field %s", name)
}

// ResetField resets all changes in the mutation for the field with the given name.
// It returns an error if the field is not defined in the schema.
func (m *SubjectMutation) ResetField(name string) error {
	switch name {
	case subject.FieldPrecedesSubjectID:
		m.ResetPrecedesSubjectID()
		return nil
	case subject.FieldSubjectName:
		m.ResetSubjectName()
		return nil
	case subject.FieldSubjectCode:
		m.ResetSubjectCode()
		return nil
	case subject.FieldTrimester:
		m.ResetTrimester()
		return nil
	}
	return fmt.Errorf("unknown Subject field %s", name)
}

// AddedEdges returns all edge names that were set/added in this mutation.
func (m *SubjectMutation) AddedEdges() []string {
	edges := make([]string, 0, 3)
	if m.precedes_subject != nil {
		edges = append(edges, subject.EdgePrecedesSubject)
	}
	if m.next_subject != nil {
		edges = append(edges, subject.EdgeNextSubject)
	}
	if m.carrer != nil {
		edges = append(edges, subject.EdgeCarrer)
	}
	return edges
}

// AddedIDs returns all IDs (to other nodes) that were added for the given edge
// name in this mutation.
func (m *SubjectMutation) AddedIDs(name string) []ent.Value {
	switch name {
	case subject.EdgePrecedesSubject:
		if id := m.precedes_subject; id != nil {
			return []ent.Value{*id}
		}
	case subject.EdgeNextSubject:
		ids := make([]ent.Value, 0, len(m.next_subject))
		for id := range m.next_subject {
			ids = append(ids, id)
		}
		return ids
	case subject.EdgeCarrer:
		ids := make([]ent.Value, 0, len(m.carrer))
		for id := range m.carrer {
			ids = append(ids, id)
		}
		return ids
	}
	return nil
}

// RemovedEdges returns all edge names that were removed in this mutation.
func (m *SubjectMutation) RemovedEdges() []string {
	edges := make([]string, 0, 3)
	if m.removednext_subject != nil {
		edges = append(edges, subject.EdgeNextSubject)
	}
	if m.removedcarrer != nil {
		edges = append(edges, subject.EdgeCarrer)
	}
	return edges
}

// RemovedIDs returns all IDs (to other nodes) that were removed for the edge with
// the given name in this mutation.
func (m *SubjectMutation) RemovedIDs(name string) []ent.Value {
	switch name {
	case subject.EdgeNextSubject:
		ids := make([]ent.Value, 0, len(m.removednext_subject))
		for id := range m.removednext_subject {
			ids = append(ids, id)
		}
		return ids
	case subject.EdgeCarrer:
		ids := make([]ent.Value, 0, len(m.removedcarrer))
		for id := range m.removedcarrer {
			ids = append(ids, id)
		}
		return ids
	}
	return nil
}

// ClearedEdges returns all edge names that were cleared in this mutation.
func (m *SubjectMutation) ClearedEdges() []string {
	edges := make([]string, 0, 3)
	if m.clearedprecedes_subject {
		edges = append(edges, subject.EdgePrecedesSubject)
	}
	if m.clearednext_subject {
		edges = append(edges, subject.EdgeNextSubject)
	}
	if m.clearedcarrer {
		edges = append(edges, subject.EdgeCarrer)
	}
	return edges
}

// EdgeCleared returns a boolean which indicates if the edge with the given name
// was cleared in this mutation.
func (m *SubjectMutation) EdgeCleared(name string) bool {
	switch name {
	case subject.EdgePrecedesSubject:
		return m.clearedprecedes_subject
	case subject.EdgeNextSubject:
		return m.clearednext_subject
	case subject.EdgeCarrer:
		return m.clearedcarrer
	}
	return false
}

// ClearEdge clears the value of the edge with the given name. It returns an error
// if that edge is not defined in the schema.
func (m *SubjectMutation) ClearEdge(name string) error {
	switch name {
	case subject.EdgePrecedesSubject:
		m.ClearPrecedesSubject()
		return nil
	}
	return fmt.Errorf("unknown Subject unique edge %s", name)
}

// ResetEdge resets all changes to the edge with the given name in this mutation.
// It returns an error if the edge is not defined in the schema.
func (m *SubjectMutation) ResetEdge(name string) error {
	switch name {
	case subject.EdgePrecedesSubject:
		m.ResetPrecedesSubject()
		return nil
	case subject.EdgeNextSubject:
		m.ResetNextSubject()
		return nil
	case subject.EdgeCarrer:
		m.ResetCarrer()
		return nil
	}
	return fmt.Errorf("unknown Subject edge %s", name)
}