package preferences

import (
	"metrograma/modules/preferences/student_preferences"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	student_preferences.Handlers(e)
}
