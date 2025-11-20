package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/auth/DTO"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func CompleteStudent(idUser string, data DTO.CompleteStudentDTO) (models.StudentWithUser, error) {
	qb := surrealql.Begin().
		Let("current", surrealql.SelectOnly("$userId").Field("verified")).
		If("$current.verified == true").
		Then(func(tb *surrealql.ThenBuilder) {
			tb.Throw("User is already verified")
		}).
		End().
		Do(surrealql.UpdateOnly("$userId").
			Set("phone", "$update.phone").
			Set("verified", true)).
		Let("student", surrealql.CreateOnly("student").
			Set("user", "$userId").
			Set("id_card", "<string> $update.id_card")).
		Let("studentId", "$student.id").
		Do(surrealql.For("careerTri", "?", "$update.careersWithTrimesters").
			LetTyped("careerId", "<record<career>>", "$careerTri.career").
			LetTyped("trimesterId", "<record<trimester>>", "$type::thing('trimester',  $careerTri.trimester)").
			Do(surrealql.Relate("$studentId", "study", "$careerId").
				Set("startingTrimester", "$trimesterId")),
		).
		Do(surrealql.CreateOnly("student_preferences").
			Set("student", "$studentId")).
		Return("$student FETCH user")

	sql, params := qb.Build()

	params["userId"] = surrealModels.NewRecordID("user", idUser)
	params["update"] = data

	result, err := surrealdb.Query[models.StudentWithUser](context.Background(), db.SurrealDB, sql, params)

	user := (*result)[0].Result

	return user, err
}
