package middlewares

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// RateLimitConfig defines rate limiting configuration
type RateLimitConfig struct {
	// Rate is the maximum number of requests per window
	Rate int
	// Burst is the maximum number of concurrent requests allowed
	Burst int
	// ExpiresIn is the time window for rate limiting
	ExpiresIn time.Duration
}

// Global rate limit: 100 requests per minute per IP
func GlobalRateLimit() echo.MiddlewareFunc {
	config := middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(
			middleware.RateLimiterMemoryStoreConfig{
				Rate:      100,
				Burst:     100,
				ExpiresIn: 1 * time.Minute,
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

// AuthRateLimit: 10 requests per minute per IP - stricter for auth routes to prevent brute force
func AuthRateLimit() echo.MiddlewareFunc {
	config := middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(
			middleware.RateLimiterMemoryStoreConfig{
				Rate:      10,
				Burst:     10,
				ExpiresIn: 1 * time.Minute,
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

// FriendRateLimit: 20 requests per minute per IP - prevent friend request spam
func FriendRateLimit() echo.MiddlewareFunc {
	config := middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(
			middleware.RateLimiterMemoryStoreConfig{
				Rate:      20,
				Burst:     20,
				ExpiresIn: 1 * time.Minute,
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

// WriteRateLimit: 50 requests per minute per IP - moderate limits for write operations
func WriteRateLimit() echo.MiddlewareFunc {
	config := middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(
			middleware.RateLimiterMemoryStoreConfig{
				Rate:      50,
				Burst:     50,
				ExpiresIn: 1 * time.Minute,
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

func rateLimitErrorHandler(ctx echo.Context, err error) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Internal server error during rate limiting")
}

func rateLimitDenyHandler(ctx echo.Context, identifier string, err error) error {
	return echo.NewHTTPError(http.StatusTooManyRequests, "Rate limit exceeded. Please try again later.")
}
