package services

import (
	"errors"
	"fmt"
	"metrograma/env"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const accessTokenTTL = 7 * 24 * time.Hour

type AccessTokenClaims struct {
	UserID string `json:"uid"`
	RoleID string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateAccessToken(userID string, roleID string) (string, error) {
	key, err := getJWTSigningKey()
	if err != nil {
		return "", err
	}

	claims := AccessTokenClaims{
		UserID: userID,
		RoleID: roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTokenTTL)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(key)
}

func ParseAccessToken(tokenStr string) (*AccessTokenClaims, error) {
	key, err := getJWTSigningKey()
	if err != nil {
		return nil, err
	}

	parsed, err := jwt.ParseWithClaims(tokenStr, &AccessTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return key, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := parsed.Claims.(*AccessTokenClaims)
	if !ok || !parsed.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.UserID == "" {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

func getJWTSigningKey() ([]byte, error) {
	key := env.GetDotEnv("USER_SIGIN_KEY")
	if key == "" {
		key = env.UserTokenSigninKey
	}
	if key == "" {
		return nil, errors.New("jwt signing key is not configured")
	}
	return []byte(key), nil
}
