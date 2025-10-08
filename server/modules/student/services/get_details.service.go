package services

import (
	"context"
	"maps"
	"metrograma/db"
	"metrograma/modules/interactions/course/services"
	studentDTO "metrograma/modules/student/DTO"

	surrealdb "github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetStudentDetails returns the student with user, careers, and passed subjects (enroll edges)
func GetStudentDetails(studentId surrealModels.RecordID, loggedUserId *surrealModels.RecordID) (*studentDTO.StudentDetails, error) {
	qb := surrealql.SelectOnly(studentId).
		Alias("careers", "->study.out").
		Alias("friends", "->(friend WHERE status == 'accepted').out").
		Field("*").
		Fetch("user", "careers", "passed_subjects", "friends", "friends.user")

	passed_subjects_Qb := surrealql.Select("$parent->enroll").
		FieldName("trimester").
		Alias("subjects", `array::group({
				subject: out,
				grade: grade,
				difficulty: difficulty,
				workload: workload
		})`).
		Alias("average_grade", "math::mean(<float>grade)").
		FieldNameAs("trimester.starting_date", "starting_date").
		Where("grade >= 10").
		GroupBy("trimester").
		OrderBy("starting_date").
		Fetch("subjects.subject")

	qb = qb.Alias("passed_subjects", passed_subjects_Qb)

	extraParams := map[string]any{}

	if loggedUserId == nil {
		qb = qb.
			Alias("pending_friends", "->(friend WHERE  status == 'pending').out").
			Alias("friend_applications", "<-(friend WHERE status == 'pending').in").
			Fetch("pending_friends", "pending_friends.user", "friend_applications", "friend_applications.user")

	} else {
		// If the user is not fetching their own details, check if they are already friends
		qb = qb.Alias("friendship_status", "(<-(friend WHERE in = $my_id ).status)[0] ?? 'none'").
			Alias("receiving_friendship_status", "(->(friend WHERE out = $my_id).status)[0] ?? 'none'")
		extraParams["my_id"] = *loggedUserId
	}

	if true {
		qb = qb.Alias("current_courses", getScheduleSubquery(studentId, "current")).
			Alias("next_courses", getScheduleSubquery(studentId, "next"))
	}

	query, params := qb.Build()

	maps.Copy(params, extraParams)

	res, err := surrealdb.Query[studentDTO.StudentDetails](context.Background(), db.SurrealDB, query, params)

	if err != nil {
		return nil, err
	}
	if res == nil || len(*res) == 0 {
		return nil, nil
	}
	data := (*res)[0].Result

	return &data, nil
}

func getScheduleSubquery(studentId surrealModels.RecordID, trimesterTime string) *surrealql.SelectQuery {
	qb := surrealql.SelectOnly("course").
		Alias("principal", services.GetSectionSubquery(true)).
		Alias("secondary", services.GetSectionSubquery(false)).
		WhereEq("in", studentId)

	if trimesterTime == "current" {
		qb = qb.Where("out.is_current = true")
	} else {
		qb = qb.Where("out.is_next = true")
	}
	return qb
}
