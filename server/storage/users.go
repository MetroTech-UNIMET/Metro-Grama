package storage

import (
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"

	"github.com/surrealdb/surrealdb.go"
)

var existUserByEmailQuery = "SELECT id, role FROM user WHERE email = $email"

func ExistUserByEmail(email string) (models.MinimalUser, error) {
	data, err := db.SurrealDB.Query(existUserByEmailQuery, map[string]string{
		"email": email,
	})

	user, err := surrealdb.SmartUnmarshal[[]models.MinimalUser](data, err)

	if err != nil {
		return models.MinimalUser{}, err
	}

	if len(user) == 0 {
		return models.MinimalUser{}, fmt.Errorf("incorrect credentials")
	}

	return user[0], nil
}

func ExistUser(id string) (models.MinimalUser, error) {
	data, err := db.SurrealDB.Select(id)

	user, err := surrealdb.SmartUnmarshal[models.MinimalUser](data, err)

	if err != nil {
		return models.MinimalUser{}, err
	}

	return user, nil
}

func GetUser(id string) (models.UserProfile, error) {
	data, err := db.SurrealDB.Select(id)

	user, err := surrealdb.SmartUnmarshal[models.UserProfile](data, err)

	if err != nil {
		return models.UserProfile{}, err
	}

	return user, nil
}

var loginQuery = "SELECT id, role FROM user WHERE email = $email AND crypto::bcrypt::compare(password, $password) = true"

func LoginUser(login models.UserLoginForm) (models.MinimalUser, error) {
	data, err := db.SurrealDB.Query(loginQuery, map[string]string{
		"email":    login.Email,
		"password": login.Password,
	})

	user, err := surrealdb.SmartUnmarshal[[]models.MinimalUser](data, err)

	if err != nil {
		return models.MinimalUser{}, err
	}

	if len(user) == 0 {
		return models.MinimalUser{}, fmt.Errorf("incorrect credentials")
	}

	return user[0], nil
}

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

var createSimpleUserQuery = `
CREATE user SET
	firstName=$firstName,
	lastName=$lastName,
	pictureUrl=$pictureUrl,
	email=$email,
	verified=$verified,
	password=crypto::bcrypt::generate($password);`

func CreateSimpleUser(user models.SimpleUserSigninForm) error {
	queryParams := map[string]interface{}{
		"firstName":  user.FirstName,
		"lastName":   user.LastName,
		"pictureUrl": user.PictureUrl,
		"email":      user.Email,
		"password":   user.Password,
		"verified":   user.Verified,
	}

	data, err := db.SurrealDB.Query(createSimpleUserQuery, queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

func DeleteUserByEmail(email string) error {
	data, err := db.SurrealDB.Query("DELETE user WHERE email = $email;", map[string]string{
		"email": email,
	})
	if err != nil {
		return err
	}

	return tools.GetSurrealErrorMsgs(data)
}
