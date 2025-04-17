package services

import (
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

// REVIEW - Analizar cuando usar para el cuando se cree un estudiante
// var createUserQuery = `
// BEGIN TRANSACTION;
// LET $student = CREATE student SET
// 	firstName=$firstName,
// 	lastName=$lastName,
// 	pictureUrl=$pictureUrl,
// 	email=$email,
// 	password=crypto::bcrypt::generate($password);
// LET $studentID = $student.id;
// RELATE $studentID->course->$careerID;
// {{ range $i, $s := .SubjectsPassed}}
// RELATE $studentID->passed->$subjectID{{$i}} SET trimester = $trimester{{$i}};
// {{end}}
// COMMIT TRANSACTION;`

// func CreateStudent(user models.StudentSigninForm) error {
// 	t, err := template.New("query").Parse(createUserQuery)
// 	if err != nil {
// 		return err
// 	}
// 	var query bytes.Buffer
// 	err = t.Execute(&query, user)
// 	if err != nil {
// 		return err
// 	}

// 	queryParams := map[string]interface{}{
// 		"firstName":  user.FirstName,
// 		"lastName":   user.LastName,
// 		"pictureUrl": user.PictureUrl,
// 		"email":      user.Email,
// 		"password":   user.Password,
// 		"careerID":   user.CareerID,
// 	}

// 	for i, s := range user.SubjectsPassed {
// 		queryParams[fmt.Sprintf("subjectID%d", i)] = s.ID
// 		queryParams[fmt.Sprintf("trimester%d", i)] = s.Trimester
// 	}

// 	data, err := db.SurrealDB.Query(query.String(), queryParams)
// 	if err != nil {
// 		return err
// 	}
// 	return tools.GetSurrealErrorMsgs(data)
// }
// REVIEW - Fin review

// var createSimpleUserQuery = `
// CREATE user SET
// 	firstName=$firstName,
// 	lastName=$lastName,
// 	pictureUrl=$pictureUrl,
// 	email=$email,
// 	verified=$verified,
// 	password=crypto::bcrypt::generate($password);`

func CreateSimpleUser(user models.SimpleUserSigninForm) error {
	queryParams := map[string]any{
		"firstName":  user.FirstName,
		"lastName":   user.LastName,
		"pictureUrl": user.PictureUrl,
		"email":      user.Email,
		"password":   user.Password,
		"verified":   user.Verified,
	}

	data, err := surrealdb.Create[models.UserEntity](db.SurrealDB, surrealModels.Table("user"), queryParams)

	// data, err := db.SurrealDB.Query(createSimpleUserQuery, queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(*data)
}