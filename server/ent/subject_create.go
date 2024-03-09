// Code generated by ent, DO NOT EDIT.

package ent

import (
	"context"
	"errors"
	"fmt"
	"metrograma/ent/career"
	"metrograma/ent/subject"

	"entgo.io/ent/dialect/sql/sqlgraph"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// SubjectCreate is the builder for creating a Subject entity.
type SubjectCreate struct {
	config
	mutation *SubjectMutation
	hooks    []Hook
}

// SetPrecedesSubjectID sets the "precedes_subject_id" field.
func (sc *SubjectCreate) SetPrecedesSubjectID(u uuid.UUID) *SubjectCreate {
	sc.mutation.SetPrecedesSubjectID(u)
	return sc
}

// SetNillablePrecedesSubjectID sets the "precedes_subject_id" field if the given value is not nil.
func (sc *SubjectCreate) SetNillablePrecedesSubjectID(u *uuid.UUID) *SubjectCreate {
	if u != nil {
		sc.SetPrecedesSubjectID(*u)
	}
	return sc
}

// SetSubjectName sets the "subject_name" field.
func (sc *SubjectCreate) SetSubjectName(s string) *SubjectCreate {
	sc.mutation.SetSubjectName(s)
	return sc
}

// SetSubjectCode sets the "subject_code" field.
func (sc *SubjectCreate) SetSubjectCode(s string) *SubjectCreate {
	sc.mutation.SetSubjectCode(s)
	return sc
}

// SetTrimester sets the "trimester" field.
func (sc *SubjectCreate) SetTrimester(u uint8) *SubjectCreate {
	sc.mutation.SetTrimester(u)
	return sc
}

// SetID sets the "id" field.
func (sc *SubjectCreate) SetID(u uuid.UUID) *SubjectCreate {
	sc.mutation.SetID(u)
	return sc
}

// SetNillableID sets the "id" field if the given value is not nil.
func (sc *SubjectCreate) SetNillableID(u *uuid.UUID) *SubjectCreate {
	if u != nil {
		sc.SetID(*u)
	}
	return sc
}

// SetPrecedesSubject sets the "precedes_subject" edge to the Subject entity.
func (sc *SubjectCreate) SetPrecedesSubject(s *Subject) *SubjectCreate {
	return sc.SetPrecedesSubjectID(s.ID)
}

// AddNextSubjectIDs adds the "next_subject" edge to the Subject entity by IDs.
func (sc *SubjectCreate) AddNextSubjectIDs(ids ...uuid.UUID) *SubjectCreate {
	sc.mutation.AddNextSubjectIDs(ids...)
	return sc
}

// AddNextSubject adds the "next_subject" edges to the Subject entity.
func (sc *SubjectCreate) AddNextSubject(s ...*Subject) *SubjectCreate {
	ids := make([]uuid.UUID, len(s))
	for i := range s {
		ids[i] = s[i].ID
	}
	return sc.AddNextSubjectIDs(ids...)
}

// AddCarrerIDs adds the "carrer" edge to the Career entity by IDs.
func (sc *SubjectCreate) AddCarrerIDs(ids ...uuid.UUID) *SubjectCreate {
	sc.mutation.AddCarrerIDs(ids...)
	return sc
}

// AddCarrer adds the "carrer" edges to the Career entity.
func (sc *SubjectCreate) AddCarrer(c ...*Career) *SubjectCreate {
	ids := make([]uuid.UUID, len(c))
	for i := range c {
		ids[i] = c[i].ID
	}
	return sc.AddCarrerIDs(ids...)
}

// Mutation returns the SubjectMutation object of the builder.
func (sc *SubjectCreate) Mutation() *SubjectMutation {
	return sc.mutation
}

// Save creates the Subject in the database.
func (sc *SubjectCreate) Save(ctx context.Context) (*Subject, error) {
	sc.defaults()
	return withHooks(ctx, sc.sqlSave, sc.mutation, sc.hooks)
}

// SaveX calls Save and panics if Save returns an error.
func (sc *SubjectCreate) SaveX(ctx context.Context) *Subject {
	v, err := sc.Save(ctx)
	if err != nil {
		panic(err)
	}
	return v
}

// Exec executes the query.
func (sc *SubjectCreate) Exec(ctx context.Context) error {
	_, err := sc.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (sc *SubjectCreate) ExecX(ctx context.Context) {
	if err := sc.Exec(ctx); err != nil {
		panic(err)
	}
}

// defaults sets the default values of the builder before save.
func (sc *SubjectCreate) defaults() {
	if _, ok := sc.mutation.ID(); !ok {
		v := subject.DefaultID()
		sc.mutation.SetID(v)
	}
}

// check runs all checks and user-defined validators on the builder.
func (sc *SubjectCreate) check() error {
	if _, ok := sc.mutation.SubjectName(); !ok {
		return &ValidationError{Name: "subject_name", err: errors.New(`ent: missing required field "Subject.subject_name"`)}
	}
	if v, ok := sc.mutation.SubjectName(); ok {
		if err := subject.SubjectNameValidator(v); err != nil {
			return &ValidationError{Name: "subject_name", err: fmt.Errorf(`ent: validator failed for field "Subject.subject_name": %w`, err)}
		}
	}
	if _, ok := sc.mutation.SubjectCode(); !ok {
		return &ValidationError{Name: "subject_code", err: errors.New(`ent: missing required field "Subject.subject_code"`)}
	}
	if v, ok := sc.mutation.SubjectCode(); ok {
		if err := subject.SubjectCodeValidator(v); err != nil {
			return &ValidationError{Name: "subject_code", err: fmt.Errorf(`ent: validator failed for field "Subject.subject_code": %w`, err)}
		}
	}
	if _, ok := sc.mutation.Trimester(); !ok {
		return &ValidationError{Name: "trimester", err: errors.New(`ent: missing required field "Subject.trimester"`)}
	}
	return nil
}

func (sc *SubjectCreate) sqlSave(ctx context.Context) (*Subject, error) {
	if err := sc.check(); err != nil {
		return nil, err
	}
	_node, _spec := sc.createSpec()
	if err := sqlgraph.CreateNode(ctx, sc.driver, _spec); err != nil {
		if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return nil, err
	}
	if _spec.ID.Value != nil {
		if id, ok := _spec.ID.Value.(*uuid.UUID); ok {
			_node.ID = *id
		} else if err := _node.ID.Scan(_spec.ID.Value); err != nil {
			return nil, err
		}
	}
	sc.mutation.id = &_node.ID
	sc.mutation.done = true
	return _node, nil
}

func (sc *SubjectCreate) createSpec() (*Subject, *sqlgraph.CreateSpec) {
	var (
		_node = &Subject{config: sc.config}
		_spec = sqlgraph.NewCreateSpec(subject.Table, sqlgraph.NewFieldSpec(subject.FieldID, field.TypeUUID))
	)
	if id, ok := sc.mutation.ID(); ok {
		_node.ID = id
		_spec.ID.Value = &id
	}
	if value, ok := sc.mutation.SubjectName(); ok {
		_spec.SetField(subject.FieldSubjectName, field.TypeString, value)
		_node.SubjectName = value
	}
	if value, ok := sc.mutation.SubjectCode(); ok {
		_spec.SetField(subject.FieldSubjectCode, field.TypeString, value)
		_node.SubjectCode = value
	}
	if value, ok := sc.mutation.Trimester(); ok {
		_spec.SetField(subject.FieldTrimester, field.TypeUint8, value)
		_node.Trimester = value
	}
	if nodes := sc.mutation.PrecedesSubjectIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   subject.PrecedesSubjectTable,
			Columns: []string{subject.PrecedesSubjectColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(subject.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_node.PrecedesSubjectID = &nodes[0]
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := sc.mutation.NextSubjectIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   subject.NextSubjectTable,
			Columns: []string{subject.NextSubjectColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(subject.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := sc.mutation.CarrerIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2M,
			Inverse: true,
			Table:   subject.CarrerTable,
			Columns: subject.CarrerPrimaryKey,
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(career.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	return _node, _spec
}

// SubjectCreateBulk is the builder for creating many Subject entities in bulk.
type SubjectCreateBulk struct {
	config
	err      error
	builders []*SubjectCreate
}

// Save creates the Subject entities in the database.
func (scb *SubjectCreateBulk) Save(ctx context.Context) ([]*Subject, error) {
	if scb.err != nil {
		return nil, scb.err
	}
	specs := make([]*sqlgraph.CreateSpec, len(scb.builders))
	nodes := make([]*Subject, len(scb.builders))
	mutators := make([]Mutator, len(scb.builders))
	for i := range scb.builders {
		func(i int, root context.Context) {
			builder := scb.builders[i]
			builder.defaults()
			var mut Mutator = MutateFunc(func(ctx context.Context, m Mutation) (Value, error) {
				mutation, ok := m.(*SubjectMutation)
				if !ok {
					return nil, fmt.Errorf("unexpected mutation type %T", m)
				}
				if err := builder.check(); err != nil {
					return nil, err
				}
				builder.mutation = mutation
				var err error
				nodes[i], specs[i] = builder.createSpec()
				if i < len(mutators)-1 {
					_, err = mutators[i+1].Mutate(root, scb.builders[i+1].mutation)
				} else {
					spec := &sqlgraph.BatchCreateSpec{Nodes: specs}
					// Invoke the actual operation on the latest mutation in the chain.
					if err = sqlgraph.BatchCreate(ctx, scb.driver, spec); err != nil {
						if sqlgraph.IsConstraintError(err) {
							err = &ConstraintError{msg: err.Error(), wrap: err}
						}
					}
				}
				if err != nil {
					return nil, err
				}
				mutation.id = &nodes[i].ID
				mutation.done = true
				return nodes[i], nil
			})
			for i := len(builder.hooks) - 1; i >= 0; i-- {
				mut = builder.hooks[i](mut)
			}
			mutators[i] = mut
		}(i, ctx)
	}
	if len(mutators) > 0 {
		if _, err := mutators[0].Mutate(ctx, scb.builders[0].mutation); err != nil {
			return nil, err
		}
	}
	return nodes, nil
}

// SaveX is like Save, but panics if an error occurs.
func (scb *SubjectCreateBulk) SaveX(ctx context.Context) []*Subject {
	v, err := scb.Save(ctx)
	if err != nil {
		panic(err)
	}
	return v
}

// Exec executes the query.
func (scb *SubjectCreateBulk) Exec(ctx context.Context) error {
	_, err := scb.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (scb *SubjectCreateBulk) ExecX(ctx context.Context) {
	if err := scb.Exec(ctx); err != nil {
		panic(err)
	}
}
