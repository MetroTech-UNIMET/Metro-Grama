// Code generated by ent, DO NOT EDIT.

package migrate

import (
	"entgo.io/ent/dialect/sql/schema"
	"entgo.io/ent/schema/field"
)

var (
	// CareersColumns holds the columns for the "careers" table.
	CareersColumns = []*schema.Column{
		{Name: "id", Type: field.TypeUUID},
		{Name: "name", Type: field.TypeString, Unique: true},
	}
	// CareersTable holds the schema information for the "careers" table.
	CareersTable = &schema.Table{
		Name:       "careers",
		Columns:    CareersColumns,
		PrimaryKey: []*schema.Column{CareersColumns[0]},
	}
	// SubjectsColumns holds the columns for the "subjects" table.
	SubjectsColumns = []*schema.Column{
		{Name: "id", Type: field.TypeUUID},
		{Name: "subject_name", Type: field.TypeString},
		{Name: "subject_code", Type: field.TypeString, Unique: true},
		{Name: "trimester", Type: field.TypeUint},
		{Name: "precedes_subject_id", Type: field.TypeUUID, Nullable: true},
	}
	// SubjectsTable holds the schema information for the "subjects" table.
	SubjectsTable = &schema.Table{
		Name:       "subjects",
		Columns:    SubjectsColumns,
		PrimaryKey: []*schema.Column{SubjectsColumns[0]},
		ForeignKeys: []*schema.ForeignKey{
			{
				Symbol:     "subjects_subjects_next_subject",
				Columns:    []*schema.Column{SubjectsColumns[4]},
				RefColumns: []*schema.Column{SubjectsColumns[0]},
				OnDelete:   schema.SetNull,
			},
		},
	}
	// CareerSubjectsColumns holds the columns for the "career_subjects" table.
	CareerSubjectsColumns = []*schema.Column{
		{Name: "career_id", Type: field.TypeUUID},
		{Name: "subject_id", Type: field.TypeUUID},
	}
	// CareerSubjectsTable holds the schema information for the "career_subjects" table.
	CareerSubjectsTable = &schema.Table{
		Name:       "career_subjects",
		Columns:    CareerSubjectsColumns,
		PrimaryKey: []*schema.Column{CareerSubjectsColumns[0], CareerSubjectsColumns[1]},
		ForeignKeys: []*schema.ForeignKey{
			{
				Symbol:     "career_subjects_career_id",
				Columns:    []*schema.Column{CareerSubjectsColumns[0]},
				RefColumns: []*schema.Column{CareersColumns[0]},
				OnDelete:   schema.Cascade,
			},
			{
				Symbol:     "career_subjects_subject_id",
				Columns:    []*schema.Column{CareerSubjectsColumns[1]},
				RefColumns: []*schema.Column{SubjectsColumns[0]},
				OnDelete:   schema.Cascade,
			},
		},
	}
	// Tables holds all the tables in the schema.
	Tables = []*schema.Table{
		CareersTable,
		SubjectsTable,
		CareerSubjectsTable,
	}
)

func init() {
	SubjectsTable.ForeignKeys[0].RefTable = SubjectsTable
	CareerSubjectsTable.ForeignKeys[0].RefTable = CareersTable
	CareerSubjectsTable.ForeignKeys[1].RefTable = SubjectsTable
}