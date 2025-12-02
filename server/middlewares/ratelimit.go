package middlewares

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

// Rate limiting configuration constants
const (
	// GlobalRateLimitRate is the maximum number of requests per minute for all routes
	GlobalRateLimitRate = 100
	// AuthRateLimitRate is the maximum number of requests per minute for auth routes (stricter to prevent brute force)
	AuthRateLimitRate = 10
	// FriendRateLimitRate is the maximum number of requests per minute for friend routes (prevent spam)
	FriendRateLimitRate = 20
	// WriteRateLimitRate is the maximum number of requests per minute for write operations
	WriteRateLimitRate = 50
	// RateLimitWindow is the time window for rate limiting
	RateLimitWindow = 1 * time.Minute
)

// createRateLimiter creates a rate limiter middleware with the specified rate
func createRateLimiter(rateLimit int) echo.MiddlewareFunc {
	config := middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(
			middleware.RateLimiterMemoryStoreConfig{
				Rate:      rate.Limit(rateLimit),
				Burst:     rateLimit,
				ExpiresIn: RateLimitWindow,
			},
		),
		IdentifierExtractor: func(ctx echo.Context) (string, error) {
			return ctx.RealIP(), nil
		},
		ErrorHandler: rateLimitErrorHandler,
		DenyHandler:  rateLimitDenyHandler,
	}
	return middleware.RateLimiterWithConfig(config)
}

// GlobalRateLimit applies a global rate limit: 100 requests per minute per IP
func GlobalRateLimit() echo.MiddlewareFunc {
	return createRateLimiter(GlobalRateLimitRate)
}

// AuthRateLimit applies stricter rate limit: 10 requests per minute per IP to prevent brute force
func AuthRateLimit() echo.MiddlewareFunc {
	return createRateLimiter(AuthRateLimitRate)
}

// FriendRateLimit applies rate limit: 20 requests per minute per IP to prevent friend request spam
func FriendRateLimit() echo.MiddlewareFunc {
	return createRateLimiter(FriendRateLimitRate)
}

// WriteRateLimit applies moderate rate limit: 50 requests per minute per IP for write operations
func WriteRateLimit() echo.MiddlewareFunc {
	return createRateLimiter(WriteRateLimitRate)
}

func rateLimitErrorHandler(ctx echo.Context, err error) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error during rate limiting")
}

func rateLimitDenyHandler(ctx echo.Context, identifier string, err error) error {
	return echo.NewHTTPError(http.StatusTooManyRequests, "Rate limit exceeded. Please try again later.")
}
