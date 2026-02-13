package middlewares

import (
	"fmt"
	"metrograma/modules/auth/DTO"
	"net/http"

	crudServices "metrograma/modules/auth/services/crud"

	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	surrealModels "github.com/surrealdb/surrealdb.go/pkg/models"
)

func UserAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := getUserFromSession(c)
		if err != nil {
			return err
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}

func AdminAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user, err := getUserFromSession(c)
		if err != nil {
			return err
		}

		if user.Role.ID != "admin" {
			return echo.NewHTTPError(http.StatusUnauthorized)
		}

		c.Set("user-id", user.ID)

		return next(c)
	}
}

func getUserFromSession(c echo.Context) (*DTO.MinimalUser, error) {
	// DIAGNÓSTICO 1: ¿Llega la cookie?
	cookie, errCookie := c.Cookie("auth")
	if errCookie != nil {
		fmt.Println("❌ ERROR CRÍTICO: El navegador NO envió la cookie 'auth'.")
		fmt.Println("   Causa probable: SameSite=Strict/Lax en petición Cross-Origin.")
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "Cookie missing")
	} else {
		fmt.Printf("✅ Cookie recibida: %s...\n", cookie.Value[:10])
	}

	// DIAGNÓSTICO 2: ¿Se puede desencriptar la sesión?
	sessAuth, err := session.Get("auth", c)
	if err != nil {
		fmt.Printf("❌ ERROR: session.Get falló. Causa: %v\n", err)
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "Session invalid")
	}

	// DIAGNÓSTICO 3: ¿Existe el valor 'user-id' en la sesión?
	userID, ok := sessAuth.Values["user-id"]
	if !ok {
		fmt.Println("❌ ERROR: La sesión es válida pero NO tiene 'user-id'.")
		fmt.Printf("   Valores actuales en sesión: %v\n", sessAuth.Values)
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "User ID missing in session")
	}

	// DIAGNÓSTICO 4: ¿El tipo de dato es correcto?
	// Aquí sospecho que puede estar el problema con SurrealDB
	userIDStr, ok := userID.(string)
	if !ok {
		fmt.Printf("❌ ERROR DE TIPO: 'user-id' existe pero no es string.\n")
		fmt.Printf("   Tipo recibido: %T, Valor: %v\n", userID, userID)
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "User ID type mismatch")
	}

	fmt.Printf("✅ Usuario encontrado en sesión: %s. Buscando en BD...\n", userIDStr)

	// DIAGNÓSTICO 5: ¿Existe en SurrealDB?
	user, err := crudServices.ExistUser(surrealModels.NewRecordID("user", userIDStr))
	if err != nil {
		fmt.Printf("❌ ERROR BD: No se pudo obtener usuario %s. Error: %v\n", userIDStr, err)
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "User not found in DB")
	}

	return &user, nil
}
