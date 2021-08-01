package routes

import (
	"fmt"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/ot/session"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/routes/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/routes/circuits"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/gin-gonic/gin"
)

func pingHandler(c *gin.Context) {
	userId := c.Request.Header.Get(api.Identity)
	c.JSON(http.StatusOK, fmt.Sprintf("Thank you for pinging: %s", userId))
}

func RegisterRoutes(router *gin.Engine, userCsif interfaces.CircuitStorageInterfaceFactory, accessDriver interfaces.AccessDriver, sessionManager *session.SessionManager) {
	// TODO: api versioning
	router.GET("/api/ping", pingHandler)

	w := func(h api.HandlerFunc) gin.HandlerFunc {
		return api.Wrap(accessDriver, userCsif, h)
	}

	// User-saveable circuits
	router.GET("/api/circuits/:id", w(circuits.Load))
	router.GET("/api/circuits", w(circuits.Query))
	router.POST("/api/circuits", w(circuits.Create))
	router.PUT("/api/circuits/:id", w(circuits.Store))
	router.POST("/api/circuits/:id/delete", w(circuits.Delete))

	// Circuit permission control
	wa := access.Wrapper
	router.GET("/api/access/circuit/:cid", w(wa(access.GetCircuit)))
	router.PUT("/api/access/circuit/:cid/user", w(wa(access.UpsertCircuitUser)))
	router.PUT("/api/access/circuit/:cid/link", w(wa(access.UpsertCircuitLink)))
	router.POST("/api/access/circuit/:cid/user/:uid", w(wa(access.UpsertCircuitUser)))
	router.POST("/api/access/circuit/:cid/link/:lid", w(wa(access.UpsertCircuitLink)))

	// OT
	router.POST("/api/ot/:cid", sessionManager.Establish)
}
