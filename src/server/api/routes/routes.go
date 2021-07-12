package routes

import (
	"fmt"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	accessApi "github.com/OpenCircuits/OpenCircuits/site/go/api/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/circuits"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/gin-gonic/gin"
)

func pingHandler(c *gin.Context) {
	userId := c.Request.Header.Get(api.Identity)
	c.JSON(http.StatusOK, fmt.Sprintf("Thank you for pinging: %s", userId))
}

func RegisterRoutes(router *gin.Engine, userCsif interfaces.CircuitStorageInterfaceFactory, accessDriver access.DataDriver) {

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
	wa := accessApi.Wrapper
	router.GET("/api/access/circuit/:cid", w(wa(accessApi.GetCircuit)))
	router.PUT("/api/access/circuit/:cid/user", w(wa(accessApi.UpsertCircuitUser)))
	router.PUT("/api/access/circuit/:cid/link", w(wa(accessApi.UpsertCircuitLink)))
	router.POST("/api/access/circuit/:cid/user/:uid", w(wa(accessApi.UpsertCircuitUser)))
	router.POST("/api/access/circuit/:cid/link/:lid", w(wa(accessApi.UpsertCircuitLink)))
}
