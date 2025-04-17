package services

import (
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
)

func CreateSubject(subject models.SubjectForm) error {
	query := `
	BEGIN TRANSACTION;

	CREATE subject:$code CONTENT {
		name: $name
		-- credits: $credits,
		-- BPCredits: $BPCredits
	};

	FOR $career IN $careers {
		RELATE subject:$code->belong->$career.careerID SET trimester = $career.trimester;
	};

	FOR $precede IN $precedesID {
		RELATE subject:$code->precede->$precede;
	};

	COMMIT TRANSACTION;
	`

	queryParams := map[string]any{
		"code":      subject.Code,
		"name":      subject.Name,
		// "credits":   subject.Credits,
		// "BPCredits": subject.BPCredits,
		"careers":   subject.Careers,
		"precedesID": subject.PrecedesID,
	}

	result, err := surrealdb.Query[models.SubjectEntity](db.SurrealDB, query, queryParams)
	if err != nil {
		return fmt.Errorf("error creating subject: %v", err)
	}

	data := (*result)[0].Result
	return tools.GetSurrealErrorMsgs(data)
} 