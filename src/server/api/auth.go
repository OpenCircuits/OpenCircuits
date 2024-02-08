package api

import (
	"net/http"
	"strings"

	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
)

const Identity = "identity"

// AuthMiddleware injects user identity into authenticated requests
func AuthMiddleware(manager auth.AuthenticationManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only use auth in API routes
		if !strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.Next()
			return
		}

		t := c.GetHeader("authType")
		if t == "" {
			t = "anon"
		}

		id, err := manager.ExtractIdentity(t, c.GetHeader("authId"))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.Keys[Identity] = id
		c.Next()
	}
}
