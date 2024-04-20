package storage

import (
	"bytes"
	"fmt"
	"metrograma/db"
	"metrograma/models"
	"metrograma/tools"
	"text/template"
)

func LoginStudent(login models.StudentLoginForm) {

}

var createUserQuery = `
BEGIN TRANSACTION;
LET $student = CREATE student SET
	firstName=$firstName,
	lastName=$lastName,
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
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"password":  user.Password,
		"careerID":  user.CareerID,
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

func DeleteStudentByEmail(email string) error {
	data, err := db.SurrealDB.Query("DELETE student WHERE email = $email;", map[string]string{
		"email": email,
	})
	if err != nil {
		return err
	}

	return tools.GetSurrealErrorMsgs(data)
}
