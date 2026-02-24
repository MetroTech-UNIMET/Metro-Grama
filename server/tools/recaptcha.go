package tools

import (
	"encoding/json"
	"fmt"
	"metrograma/env"
	"net/http"
	"net/url"
	"time"
)

type RecaptchaResponse struct {
	Success     bool      `json:"success"`
	Score       float64   `json:"score"`
	Action      string    `json:"action"`
	ChallengeTS time.Time `json:"challenge_ts"`
	Hostname    string    `json:"hostname"`
	ErrorCodes  []string  `json:"error-codes"`
}

const scoreTreshold = 0.65

func VerifyRecaptcha(token string, action string) (bool, error) {
	// Skip validation if no key configured (e.g. dev mode)
	if env.RecaptchaSecretKey == "" {
		// Only in non-production effectively "disable" it
		if !env.IsProduction {
			return true, nil
		}
		return false, fmt.Errorf("RECAPTCHA_SECRET_KEY not configured")
	}

	resp, err := http.PostForm("https://www.google.com/recaptcha/api/siteverify",
		url.Values{
			"secret":   {env.RecaptchaSecretKey},
			"response": {token},
		})
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	var result RecaptchaResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}

	if !result.Success || result.Score < scoreTreshold || result.Action != action {
		return false, nil
	}

	return true, nil
}
