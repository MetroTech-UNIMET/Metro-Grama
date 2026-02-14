package services

import (
	"context"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/auth/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func CompleteStudent(idUser string, data DTO.CompleteStudentDTO) (models.StudentWithUser, error) {
	idCardString := fmt.Sprintf("%d", data.IDCard)

	qb := surrealql.Begin().
		Let("current", surrealql.SelectOnly("$userId").Field("verified")).
		If("$current.verified == true").
		Then(func(tb *surrealql.ThenBuilder) {
			tb.Throw("User is already verified")
		}).
		End().
		Do(surrealql.UpdateOnly("$userId").
			Set("phone", data.Phone).
			Set("verified", true)).
		Let("student", surrealql.CreateOnly("student").
			Set("user", surrealql.Expr("$userId")).
			Set("id_card", idCardString)).
		Let("studentId", surrealql.Expr("$student.id")).
		Do(surrealql.For("careerTri", "?", data.CareersWithTrimesters).
			LetTyped("careerId", "record<career>", surrealql.Expr("type::thing('career',  $careerTri.career)")).
			LetTyped("trimesterId", "record<trimester>", surrealql.Expr("type::thing('trimester',  $careerTri.trimester)")).
			Do(surrealql.Relate("$studentId", "study", "$careerId").
				Set("startingTrimester", surrealql.Expr("$trimesterId"))),
		).
		Do(surrealql.CreateOnly("student_preferences").
			Set("student", surrealql.Expr("$studentId"))).
		Return("$student FETCH user")

	sql, params := qb.Build()

	params["userId"] = surrealModels.NewRecordID("user", idUser)
	// params["update"] = data

	result, err := surrealdb.Query[models.StudentWithUser](context.Background(), db.SurrealDB, sql, params)

	user := (*result)[0].Result

	return user, err
}
