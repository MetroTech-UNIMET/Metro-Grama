package storage

import (
	"bytes"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"text/template"

	"github.com/surrealdb/surrealdb.go"
)

var existStudentByEmailQuery = "SELECT id, role FROM student WHERE email = $email"

func ExistStudentByEmail(email string) (models.MinimalStudent, error) {
	data, err := db.SurrealDB.Query(existStudentByEmailQuery, map[string]string{
		"email": email,
	})

	user, err := surrealdb.SmartUnmarshal[[]models.MinimalStudent](data, err)

	if err != nil {
		return models.MinimalStudent{}, err
	}

	if len(user) == 0 {
		return models.MinimalStudent{}, fmt.Errorf("incorrect credentials")
	}

	return user[0], nil
}

func ExistStudent(id string) (models.MinimalStudent, error) {
	data, err := db.SurrealDB.Select(id)

	user, err := surrealdb.SmartUnmarshal[models.MinimalStudent](data, err)

	if err != nil {
		return models.MinimalStudent{}, err
	}

	return user, nil
}

func GetStudent(id string) (models.StudentProfile, error) {
	data, err := db.SurrealDB.Select(id)

	user, err := surrealdb.SmartUnmarshal[models.StudentProfile](data, err)

	if err != nil {
		return models.StudentProfile{}, err
	}

	return user, nil
}

var loginQuery = "SELECT id, role FROM student WHERE email = $email AND crypto::bcrypt::compare(password, $password) = true"

func LoginStudent(login models.StudentLoginForm) (models.MinimalStudent, error) {
	data, err := db.SurrealDB.Query(loginQuery, map[string]string{
		"email":    login.Email,
		"password": login.Password,
	})

	user, err := surrealdb.SmartUnmarshal[[]models.MinimalStudent](data, err)

	if err != nil {
		return models.MinimalStudent{}, err
	}

	if len(user) == 0 {
		return models.MinimalStudent{}, fmt.Errorf("incorrect credentials")
	}

	return user[0], nil
}

var createUserQuery = `
BEGIN TRANSACTION;
LET $student = CREATE student SET
	firstName=$firstName,
	lastName=$lastName,
	pictureUrl=$pictureUrl,
	email=$email,
	password=crypto::bcrypt::generate($password);
LET $studentID = $student.id;
RELATE $studentID->course->$careerID;
{{ range $i, $s := .SubjectsPassed}}
RELATE $studentID->passed->$subjectID{{$i}} SET trimester = $trimester{{$i}};
{{end}}
COMMIT TRANSACTION;`

func CreateStudent(user models.StudentSigninForm) error {
	t, err := template.New("query").Parse(createUserQuery)
	if err != nil {
		return err
	}
	var query bytes.Buffer
	err = t.Execute(&query, user)
	if err != nil {
		return err
	}

	queryParams := map[string]interface{}{
		"firstName":  user.FirstName,
		"lastName":   user.LastName,
		"pictureUrl": user.PictureUrl,
		"email":      user.Email,
		"password":   user.Password,
		"careerID":   user.CareerID,
	}

	for i, s := range user.SubjectsPassed {
		queryParams[fmt.Sprintf("subjectID%d", i)] = s.ID
		queryParams[fmt.Sprintf("trimester%d", i)] = s.Trimester
	}

	data, err := db.SurrealDB.Query(query.String(), queryParams)
	if err != nil {
		return err
	}
	return tools.GetSurrealErrorMsgs(data)
}

var createSimpleUserQuery = `
CREATE student SET
	firstName=$firstName,
	lastName=$lastName,
	pictureUrl=$pictureUrl,
	email=$email,
	verified=$verified,
	password=crypto::bcrypt::generate($password);`

func CreateSimpleStudent(user models.SimpleStudentSigninForm) error {
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

func DeleteStudentByEmail(email string) error {
	data, err := db.SurrealDB.Query("DELETE student WHERE email = $email;", map[string]string{
		"email": email,
	})
	if err != nil {
		return err
	}

	return tools.GetSurrealErrorMsgs(data)
}
