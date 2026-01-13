package utils

import (
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
)

func ConstructTransactionVariables(qb *surrealql.TransactionQuery) *surrealql.TransactionQuery {
	friendsOfAfriend_Qb := surrealql.Select("$loggedUser.{2+path}(->friend->student)").
		Alias("commonFriend", "$this[0]").
		Alias("friendOfAfriend", "$this[1]").
		Where("$this[1] != $loggedUser").
		Where("$this[1] NOT IN $friends")

	friendsOfAFriendPlanToSee_Qb := surrealql.Select("$friendsOfAfriend").
		Alias("commonFriend", "$this.commonFriend").
		Alias("friendOfAfriend", "$this.friendOfAfriend").
		Alias("plan_to_see", "(?)[0] ?? []", surrealql.
			Select("$this.friendOfAfriend->(course WHERE out = $trimester)").
			Value("<set>array::union(principal_sections,secondary_sections)"),
		)

	friendsPlanToSee_Qb := surrealql.Select("$friends").
		Field("*").
		Alias("plan_to_see", "(?)[0] ?? []", surrealql.
			Select("$this->(course WHERE out = $trimester)").
			Value("<set>array::union(principal_sections,secondary_sections)"),
		)

	qb = qb.
		Let("friends", surrealql.Expr("$loggedUser->friend->student")).
		Let("friends_PlanToSee", friendsPlanToSee_Qb).
		Let("friendsOfAfriend", friendsOfAfriend_Qb).
		Let("friendOfAfriend_PlanToSee", friendsOfAFriendPlanToSee_Qb)

	return qb
}
