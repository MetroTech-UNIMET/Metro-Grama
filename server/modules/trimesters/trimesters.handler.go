package trimesters

import (
	"metrograma/modules/trimesters/services"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func Handlers(e *echo.Group) {
	trimestersGroup := e.Group("/trimesters")
	trimestersGroup.GET("/", getAllTrimesters)
}

// getAllTrimesters godoc
// @Summary      List all trimesters
// @Description  Returns all trimesters from the database
// @Tags         trimesters
// @Accept       json
// @Produce      json
// @Param        noFuture  query   bool  false  "Exclude future trimesters (default: false)"
// @Success      200  {array}  models.TrimesterEntity
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /trimesters/ [get]
func getAllTrimesters(c echo.Context) error {
	// Parse optional boolean query param noFuture (default false)
	noFuture := false
	if v := c.QueryParam("noFuture"); v != "" {
		parsed, err := strconv.ParseBool(v)

		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid noFuture parameter")
		}
		noFuture = parsed
	}

	trimesters, err := services.GetAllTrimesters(noFuture)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, trimesters)
}
