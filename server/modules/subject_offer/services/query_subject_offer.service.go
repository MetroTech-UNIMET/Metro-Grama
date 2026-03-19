package services

import (
	"context"
	"maps"
	"metrograma/db"
	enrollServices "metrograma/modules/interactions/enroll/services"
	"metrograma/modules/subject_offer/DTO"
	"metrograma/modules/subject_offer/utils"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	"github.com/surrealdb/surrealdb.go/contrib/surrealql"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// GetSubjectOfferById retrieves subject_offer edges filtered by trimester ID.
func GetSubjectOfferById(ctx context.Context, trimesterId string, studentId surrealModels.RecordID, queryParams DTO.AnnualOfferQueryParams) ([]DTO.QueryAnnualOfferWithPlanning, error) {
	isUserLogged := studentId != (surrealModels.RecordID{})
	includeElectives := false
	if queryParams.IncludeElectives != nil {
		includeElectives = *queryParams.IncludeElectives
	}

	careersArray := tools.StringToIdArray(queryParams.Careers)

	extraParams := make(map[string]any)
	qb := surrealql.Begin()

	if isUserLogged {
		qb.Let("enrolled", enrollServices.GetEnrolledSubjectsQuery()).
			Let("enrollable", enrollServices.GetEnrollableSubjectsQuery())
		qb = utils.ConstructTransactionVariables(qb)
		extraParams["studentId"] = studentId
	}
	// extraParams["enrollable"] = enrollable
	// extraParams["enrolled"] = enrolled

	subjectOffer_Qb, sections_Qb := utils.GetBaseSubjectOfferQuery(careersArray, isUserLogged, includeElectives)

	subjectOffer_Qb = subjectOffer_Qb.
		// FIXME Buscar alguna forma de cachear el resultado de fn::previous_trimesters en una variable
		Alias("avg_difficulty", "math::mean(? ?: [0])", surrealql.Select("enroll").
			Value("difficulty").
			Where("out=$parent.in AND trimester IN fn::previous_trimesters($parent.out, 3).id")).
		Alias("avg_grade", "math::mean(? ?: [0])", surrealql.Select("enroll").
			Value("grade").
			Where("out=$parent.in AND trimester IN fn::previous_trimesters($parent.out, 3).id")).
		Alias("avg_workload", "math::mean(? ?: [0])", surrealql.Select("enroll").
			Value("workload").
			Where("out=$parent.in AND trimester IN fn::previous_trimesters($parent.out, 3).id"))

	sections_Qb.
		Alias("students_planning_to_enroll", "COUNT(?)",
			surrealql.
				Select("course").
				Value("id").
				Where("$parent.id IN array::concat(principal_sections,secondary_sections)"),
		).
		Alias("last_student_editor",
			surrealql.SelectOnly("subject_section_history").
				Value(
					surrealql.SelectOnly("student").
						Field("*").
						Where("user = $parent.user_id").
						Fetch("user"),
				).
				Where("end_date = None").
				Where("subject_section = $parent.id"),
		)

	if trimesterId != "" {
		subjectOffer_Qb = subjectOffer_Qb.Where("out.id = $trimester")
		extraParams["trimester"] = surrealModels.NewRecordID("trimester", trimesterId)
	}

	if queryParams.SubjectsFilter == "enrollable" {
		subjectOffer_Qb = subjectOffer_Qb.Where("in.id IN $enrollable")
	}

	if isUserLogged {
		subjectOffer_Qb = subjectOffer_Qb.
			Alias("is_enrolled", "in IN $enrolled").
			Alias("is_enrollable", "in IN $enrollable")
	}
	qb = qb.Return("?", subjectOffer_Qb)

	query, params := qb.Build()

	maps.Copy(params, extraParams)

	result, err := surrealdb.Query[[]DTO.QueryAnnualOfferWithPlanning](ctx, db.SurrealDB, query, params)
	if err != nil {
		return nil, err
	}
	offers, err := tools.SafeResult(result, -2)
	if err != nil {
		return []DTO.QueryAnnualOfferWithPlanning{}, nil
	}
	return offers, nil
}

// Como conseguir amigos que quieren ver la materia:
// 1. Si el usuario es amigo, chequear si ShowSchedule es onlyFriends o public
// 1.5. Si el usuario es amigo de un amigo, chequear si ShowSchedule es friendsFriends o public
// 2. Si cumplen, chequear course (principal y secondary) en el mismo trimestre del query
// 3. Si cumple todo lo de arriba, devolver amigo y sección. Si es amigo de un amigo, agregar commonFriend
