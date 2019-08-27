package api

import (
	"fmt"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func authenticatedHandler(manager auth.AuthenticationManager, handler func(c *gin.Context, userId model.UserId)) func (c *gin.Context) {
	return func(c* gin.Context) {
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
				message: "Cannot call authenticated route without valid authentication header",
			})
			return
		}
		id, err := (*am).ExtractIdentity(parts[1])
		if err != nil {
			c.JSON(http.StatusBadRequest, nil)
			return
		}
		handler(c, id)
	}
}

func pingHandler(c *gin.Context, userId model.UserId) {
	c.JSON(http.StatusOK, fmt.Sprintf("Thank you for pinging: %s", userId))
}

func RegisterRoutes(router *gin.Engine, manager auth.AuthenticationManager, csif interfaces.CircuitStorageInterfaceFactory) {
	// TODO: api versioning
	router.GET("/api/ping", authenticatedHandler(manager, pingHandler))
	router.GET("/api/example/:id", getExampleCircuitHandler(csif))
}
