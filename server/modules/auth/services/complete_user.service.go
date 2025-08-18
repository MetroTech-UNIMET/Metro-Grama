package services

import (
	"context"
	"metrograma/db"
	"metrograma/models"
	"metrograma/modules/auth/DTO"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

const completeUserQuery = `
BEGIN TRANSACTION;

LET $current = SELECT verified FROM ONLY $userId;
IF $current.verified == true {
    THROW "User is already verified";
};
	
UPDATE ONLY $userId SET
		phone = $update.phone,
		verified = true;

LET $student =
    CREATE ONLY student SET
    user = $userId,
    id_card = <string> $update.id_card;
LET $studentId = $student.id;

FOR $careerTri IN $update.careersWithTrimesters {
    LET $careerId = <record<career>> $careerTri.career;
    LET $trimesterId = <record<trimester>>
        type::thing('trimester',  $careerTri.trimester);
    RELATE $studentId -> study ->$careerId SET
        startingTrimester = $trimesterId;
};

RETURN $student FETCH user;

COMMIT TRANSACTION;
`

func CompleteUser(idUser string, data DTO.CompleteStudentDTO) (any, error) {
	queryParams := map[string]any{
		"userId": surrealModels.NewRecordID("user", idUser),
		"update": data,
	}

	result, err := surrealdb.Query[models.StudentEntity](context.Background(), db.SurrealDB, completeUserQuery, queryParams)

	user := (*result)[0].Result

	return user, err
}
