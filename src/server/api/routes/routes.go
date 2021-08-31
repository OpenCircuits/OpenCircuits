package routes

import (
	"fmt"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/routes/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/routes/circuit"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/routes/circuits"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/gin-gonic/gin"
)

func pingHandler(c *gin.Context) {
	userID := c.Request.Header.Get(api.Identity)
	c.JSON(http.StatusOK, fmt.Sprintf("Thank you for pinging: %s", userID))
}

// RegisterRoutes adds API routes to the provided engine
func RegisterRoutes(router *gin.Engine, userCsif model.CircuitStorageInterfaceFactory, accessDriver model.AccessDriver, newCircuits model.CircuitDriver) {
	// TODO: api versioning
	router.GET("/api/ping", pingHandler)

	w := func(h api.HandlerFunc) gin.HandlerFunc {
		return api.Wrap(accessDriver, userCsif, newCircuits, h)
	}

	// Deprecated user-saveable circuits
	router.GET("/api/circuits/:id", w(circuits.Load))
	router.GET("/api/circuits", w(circuits.Query))
	router.POST("/api/circuits", w(circuits.Create))
	router.PUT("/api/circuits/:id", w(circuits.Store))
	router.POST("/api/circuits/:id/delete", w(circuits.Delete))

	// New circuit API
	router.POST("/api/c/query", w(circuit.Query))
	router.POST("/api/c/new", w(circuit.Create))

	// Circuit permission control
	wa := access.Wrapper
	router.GET("/api/access/circuit/:cid", w(wa(access.GetCircuit)))
	router.PUT("/api/access/circuit/:cid/user", w(wa(access.UpsertCircuitUser)))
	router.PUT("/api/access/circuit/:cid/link", w(wa(access.UpsertCircuitLink)))
	router.POST("/api/access/circuit/:cid/user/:uid", w(wa(access.UpsertCircuitUser)))
	router.POST("/api/access/circuit/:cid/link/:lid", w(wa(access.UpsertCircuitLink)))
}
