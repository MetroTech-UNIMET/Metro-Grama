package services

import (
	"context"
	"maps"
	"metrograma/db"
	studentDTO "metrograma/modules/student/DTO"

	surrealdb "github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetStudentDetails returns the student with user, careers, and passed subjects (enroll edges)
func GetStudentDetails(studentId surrealModels.RecordID, loggedUserId *surrealModels.RecordID) (*studentDTO.StudentDetails, error) {
	// TODO - Add ONLY
	qb := surrealql.Select(studentId).
		Field(surrealql.Expr("->study.out").As("careers")).
		Field(surrealql.Expr("->(friend WHERE status == 'accepted').out").As("friends")).
		Field("*").
		Fetch("user", "careers", "passed_subjects", "friends", "friends.user")

	passed_subjects_Qb := surrealql.Select("$parent->enroll").
		FieldName("trimester").
		Field(surrealql.Expr(`array::group({
        subject: out,
        grade: grade,
        difficulty: difficulty,
        workload: workload
    })`).As("subjects")).
		Field(surrealql.Expr("math::mean(<float>grade)").As("average_grade")).
		FieldNameAs("trimester.starting_date", "starting_date").
		Where("grade >= 10").
		GroupBy("trimester").
		OrderBy("starting_date").
		Fetch("subjects.subject")

	qb = qb.Field(surrealql.Expr(passed_subjects_Qb).As("passed_subjects"))

	extraParams := map[string]any{}

	if loggedUserId == nil {
		qb = qb.
			Field(surrealql.Expr("->(friend WHERE  status == 'pending').out").As("pending_friends")).
			Field(surrealql.Expr("<-(friend WHERE status == 'pending').in").As("friend_applications")).
			Fetch("pending_friends", "pending_friends.user", "friend_applications", "friend_applications.user")

	} else {
		// If the user is not fetching their own details, check if they are already friends
		qb = qb.Field(surrealql.Expr("(<-(friend WHERE in = $my_id ).status)[0] ?? 'none'").As("friendship_status")).
			Field(surrealql.Expr("(->(friend WHERE out = $my_id).status)[0] ?? 'none'").As("receiving_friendship_status"))
		extraParams["my_id"] = *loggedUserId
	}

	query, params := qb.Build()

	maps.Copy(params, extraParams)

	res, err := surrealdb.Query[[]studentDTO.StudentDetails](context.Background(), db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	if res == nil || len(*res) == 0 || (*res)[0].Result == nil || len((*res)[0].Result) == 0 {
		return nil, nil
	}
	data := (*res)[0].Result[0]

	return &data, nil
}

// REVIEW - Forma de ordenar despues de group
// SELECT * FROM (SELECT count(), importance, a FROM [
//     {
//         a: 10,
//         importance: 1
//     },
//     {
//         a: 20,
//         importance: 2
//     },
//     {
//         a: 20,
//         importance: 1
//     }
// ] GROUP BY a) ORDER BY importance DESC;
