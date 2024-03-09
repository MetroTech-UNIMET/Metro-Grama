package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// CareerGroup holds the schema definition for the CareerGroup entity.
type Career struct {
	ent.Schema
}

// Fields of the CareerGroup.
func (Career) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.New()).Default(uuid.New),
		field.String("name").Unique().NotEmpty(),
	}
}

// Edges of the CareerGroup.
func (Career) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("subjects", Subject.Type),
	}
}
