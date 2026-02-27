package services

import (
	"context"
	"maps"
	"metrograma/db"
	courseServices "metrograma/modules/interactions/course/services"
	friendServices "metrograma/modules/interactions/friend/services"
	studentPreferenceServices "metrograma/modules/preferences/student_preferences/services"
	studentDTO "metrograma/modules/student/DTO"
	"metrograma/modules/student/utils"

	surrealdb "github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetStudentDetails returns the student with user, careers, and passed subjects (enroll edges)
func GetStudentDetails(studentId surrealModels.RecordID, loggedUserId *surrealModels.RecordID) (*studentDTO.StudentDetails, error) {
	studentPreferences, err := studentPreferenceServices.GetStudentPreferencesByStudent(studentId)
	if err != nil {
		return nil, err
	}

	isFriend := false
	isFriendOfAFriend := false

	if loggedUserId != nil {
		friend, err := friendServices.IsFriend(*loggedUserId, studentId)
		if err != nil {
			return nil, err
		}
		isFriend = friend

		friendOfAFriend, err := friendServices.IsFriendOfAFriend(*loggedUserId, studentId)
		if err != nil {
			return nil, err
		}
		isFriendOfAFriend = friendOfAFriend
	}

	qb := surrealql.SelectOnly(studentId).
		Alias("careers", "->study.out").
		Alias("subject_section_history",
			surrealql.Select("subject_section_history").
				Field("*").
				Where("user_id = $parent.user").
				OrderByDesc("start_date").
				Fetch("schedules")).
		Field("*").
		Fetch("user", "careers", "enrolled_subjects", "friends", "friends.user")

	qb = utils.ApplyIfVisible(qb, loggedUserId, studentPreferences.ShowSubjects, isFriend, isFriendOfAFriend,
		func(q *surrealql.SelectQuery) *surrealql.SelectQuery {
			enrolled_subjects_Qb := surrealql.Select("$parent->enroll").
				FieldName("trimester").
				Alias("subjects", `array::group({
						subject: out,
						grade: grade,
						difficulty: difficulty,
						workload: workload
				})`).
				Alias("average_grade", "math::mean(<float>grade)").
				FieldNameAs("trimester.starting_date", "starting_date").
				GroupBy("trimester").
				OrderBy("starting_date").
				Fetch("subjects.subject")
			return qb.Alias("enrolled_subjects", enrolled_subjects_Qb)
		},
	)

	qb = utils.ApplyIfVisible(qb, loggedUserId, studentPreferences.ShowFriends, isFriend, isFriendOfAFriend,
		func(q *surrealql.SelectQuery) *surrealql.SelectQuery {
			return qb.Alias("friends", "->(friend WHERE status == 'accepted').out")
		},
	)

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

	qb = utils.ApplyIfVisible(qb, loggedUserId, studentPreferences.ShowSchedule, isFriend, isFriendOfAFriend,
		func(q *surrealql.SelectQuery) *surrealql.SelectQuery {
			return addSheduleSubquery(q, studentId)
		},
	)

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

func addSheduleSubquery(qb *surrealql.SelectQuery, studentId surrealModels.RecordID) *surrealql.SelectQuery {
	return qb.Alias("current_courses", getScheduleSubquery(studentId, "current")).
		Alias("next_courses", getScheduleSubquery(studentId, "next"))
}

func getScheduleSubquery(studentId surrealModels.RecordID, trimesterTime string) *surrealql.SelectQuery {
	qb := surrealql.SelectOnly("course").
		Alias("principal", courseServices.GetSectionSubquery(true)).
		Alias("secondary", courseServices.GetSectionSubquery(false)).
		WhereEq("in", studentId)

	if trimesterTime == "current" {
		qb = qb.Where("out.is_current = true")
	} else {
		qb = qb.Where("out.is_next = true")
	}
	return qb
}
