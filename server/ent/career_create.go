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

// CareerCreate is the builder for creating a Career entity.
type CareerCreate struct {
	config
	mutation *CareerMutation
	hooks    []Hook
}

// SetName sets the "name" field.
func (cc *CareerCreate) SetName(s string) *CareerCreate {
	cc.mutation.SetName(s)
	return cc
}

// SetID sets the "id" field.
func (cc *CareerCreate) SetID(u uuid.UUID) *CareerCreate {
	cc.mutation.SetID(u)
	return cc
}

// SetNillableID sets the "id" field if the given value is not nil.
func (cc *CareerCreate) SetNillableID(u *uuid.UUID) *CareerCreate {
	if u != nil {
		cc.SetID(*u)
	}
	return cc
}

// AddSubjectIDs adds the "subjects" edge to the Subject entity by IDs.
func (cc *CareerCreate) AddSubjectIDs(ids ...uuid.UUID) *CareerCreate {
	cc.mutation.AddSubjectIDs(ids...)
	return cc
}

// AddSubjects adds the "subjects" edges to the Subject entity.
func (cc *CareerCreate) AddSubjects(s ...*Subject) *CareerCreate {
	ids := make([]uuid.UUID, len(s))
	for i := range s {
		ids[i] = s[i].ID
	}
	return cc.AddSubjectIDs(ids...)
}

// Mutation returns the CareerMutation object of the builder.
func (cc *CareerCreate) Mutation() *CareerMutation {
	return cc.mutation
}

// Save creates the Career in the database.
func (cc *CareerCreate) Save(ctx context.Context) (*Career, error) {
	cc.defaults()
	return withHooks(ctx, cc.sqlSave, cc.mutation, cc.hooks)
}

// SaveX calls Save and panics if Save returns an error.
func (cc *CareerCreate) SaveX(ctx context.Context) *Career {
	v, err := cc.Save(ctx)
	if err != nil {
		panic(err)
	}
	return v
}

// Exec executes the query.
func (cc *CareerCreate) Exec(ctx context.Context) error {
	_, err := cc.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (cc *CareerCreate) ExecX(ctx context.Context) {
	if err := cc.Exec(ctx); err != nil {
		panic(err)
	}
}

// defaults sets the default values of the builder before save.
func (cc *CareerCreate) defaults() {
	if _, ok := cc.mutation.ID(); !ok {
		v := career.DefaultID()
		cc.mutation.SetID(v)
	}
}

// check runs all checks and user-defined validators on the builder.
func (cc *CareerCreate) check() error {
	if _, ok := cc.mutation.Name(); !ok {
		return &ValidationError{Name: "name", err: errors.New(`ent: missing required field "Career.name"`)}
	}
	if v, ok := cc.mutation.Name(); ok {
		if err := career.NameValidator(v); err != nil {
			return &ValidationError{Name: "name", err: fmt.Errorf(`ent: validator failed for field "Career.name": %w`, err)}
		}
	}
	return nil
}

func (cc *CareerCreate) sqlSave(ctx context.Context) (*Career, error) {
	if err := cc.check(); err != nil {
		return nil, err
	}
	_node, _spec := cc.createSpec()
	if err := sqlgraph.CreateNode(ctx, cc.driver, _spec); err != nil {
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
	cc.mutation.id = &_node.ID
	cc.mutation.done = true
	return _node, nil
}

func (cc *CareerCreate) createSpec() (*Career, *sqlgraph.CreateSpec) {
	var (
		_node = &Career{config: cc.config}
		_spec = sqlgraph.NewCreateSpec(career.Table, sqlgraph.NewFieldSpec(career.FieldID, field.TypeUUID))
	)
	if id, ok := cc.mutation.ID(); ok {
		_node.ID = id
		_spec.ID.Value = &id
	}
	if value, ok := cc.mutation.Name(); ok {
		_spec.SetField(career.FieldName, field.TypeString, value)
		_node.Name = value
	}
	if nodes := cc.mutation.SubjectsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2M,
			Inverse: false,
			Table:   career.SubjectsTable,
			Columns: career.SubjectsPrimaryKey,
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
	return _node, _spec
}

// CareerCreateBulk is the builder for creating many Career entities in bulk.
type CareerCreateBulk struct {
	config
	err      error
	builders []*CareerCreate
}

// Save creates the Career entities in the database.
func (ccb *CareerCreateBulk) Save(ctx context.Context) ([]*Career, error) {
	if ccb.err != nil {
		return nil, ccb.err
	}
	specs := make([]*sqlgraph.CreateSpec, len(ccb.builders))
	nodes := make([]*Career, len(ccb.builders))
	mutators := make([]Mutator, len(ccb.builders))
	for i := range ccb.builders {
		func(i int, root context.Context) {
			builder := ccb.builders[i]
			builder.defaults()
			var mut Mutator = MutateFunc(func(ctx context.Context, m Mutation) (Value, error) {
				mutation, ok := m.(*CareerMutation)
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
					_, err = mutators[i+1].Mutate(root, ccb.builders[i+1].mutation)
				} else {
					spec := &sqlgraph.BatchCreateSpec{Nodes: specs}
					// Invoke the actual operation on the latest mutation in the chain.
					if err = sqlgraph.BatchCreate(ctx, ccb.driver, spec); err != nil {
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
		if _, err := mutators[0].Mutate(ctx, ccb.builders[0].mutation); err != nil {
			return nil, err
		}
	}
	return nodes, nil
}

// SaveX is like Save, but panics if an error occurs.
func (ccb *CareerCreateBulk) SaveX(ctx context.Context) []*Career {
	v, err := ccb.Save(ctx)
	if err != nil {
		panic(err)
	}
	return v
}

// Exec executes the query.
func (ccb *CareerCreateBulk) Exec(ctx context.Context) error {
	_, err := ccb.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (ccb *CareerCreateBulk) ExecX(ctx context.Context) {
	if err := ccb.Exec(ctx); err != nil {
		panic(err)
	}
}