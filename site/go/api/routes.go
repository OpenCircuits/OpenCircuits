package api

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

// RegisterHandlers setups up the API routes with the gin Engine
func RegisterHandlers(e *gin.Engine, manager auth.AuthenticationManager) {

	e.GET("api/example/:id", getExampleCircuitHandler)
	e.GET("api/examples", getExampleCircuitListHandler)

	// A toy API route for testing that authentication headers are handled correctly
	e.POST("api/ping", func(c *gin.Context) {
		parts := strings.SplitN(c.GetHeader("auth"), " ", 2)
		if len(parts) != 2 {
			c.JSON(http.StatusBadRequest, nil)
			return
		}
		am := manager.MatchToken(parts[0])
		if am == nil {
			c.JSON(http.StatusBadRequest, struct {
				message string
			}{
				message: "Cannot call authenticated ping method without valid authentication header",
			})
			return
		}
		id, err := (*am).ExtractIdentity(parts[1])
		if err != nil {
			c.JSON(http.StatusBadRequest, nil)
			return
		}
		println("PING from username " + id)
		c.JSON(http.StatusOK, struct {
			message string
		}{
			message: "Thank you for pinging our API",
		})
	})
}
