package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Subject holds the schema definition for the Subject entity.
type Subject struct {
	ent.Schema
}

// Fields of the Subject.
func (Subject) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.New()).Default(uuid.New),
		field.UUID("precedes_subject_id", uuid.New()).Optional().Nillable(),
		field.String("subject_name").NotEmpty(),
		field.String("subject_code").NotEmpty().Unique(),
		field.Uint8("trimester"),
	}
}

// Edges of the Subject.
func (Subject) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("next_subject", Subject.Type).
			From("precedes_subject").
			Field("precedes_subject_id").
			Unique(),
		edge.From("carrer", Career.Type).Ref("subjects"),
	}
}
