package api

import (
	"net/http"
	"strings"

	"github.com/OpenCircuits/OpenCircuits/site/go/api/auth"
	"github.com/gin-gonic/gin"
)

const Identity = "identity"

// Middleware that injects user identity into authenticated requests
func AuthMiddleware(manager auth.AuthenticationManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only use auth in API routes
		if !strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.Next()
			return
		}

		am := manager.MatchToken(c.GetHeader("authType"))
		if am == nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "authenticated route called without valid header",
			})
			return
		}
		id, err := (*am).ExtractIdentity(c.GetHeader("authId"))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "failed to extract identity",
			})
			return
		}

		c.Request.Header.Add(Identity, id)
		c.Next()
	}
}
