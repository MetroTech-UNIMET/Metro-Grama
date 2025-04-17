package interactions

import (
	"metrograma/modules/interactions/enroll"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	enroll.Handlers(e)
}
