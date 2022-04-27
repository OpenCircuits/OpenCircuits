package routes

import (
	"fmt"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/gin-gonic/gin"
)

func pingHandler(c *gin.Context) {
	userID := c.Request.Header.Get(api.Identity)
	c.JSON(http.StatusOK, fmt.Sprintf("Thank you for pinging: %s", userID))
}

// RegisterRoutes adds API routes to the provided engine
func RegisterRoutes(router *gin.Engine, circuitDriver model.CircuitDriver, accessDriver model.AccessDriver) {
	// TODO: api versioning
	router.GET("/api/ping", pingHandler)

	w := func(h api.HandlerFunc) gin.HandlerFunc {
		return api.Wrap(accessDriver, circuitDriver, h)
	}

	// User-saveable circuits
	circuits := circuitRoutes{}
	router.GET("/api/circuits/:id", w(circuits.load))
	router.GET("/api/circuits", w(circuits.query))
	router.POST("/api/circuits", w(circuits.create))
	router.PUT("/api/circuits/:id", w(circuits.store))
	router.POST("/api/circuits/:id/delete", w(circuits.delete))

	// Circuit permission control
	access := accessRoutes{}
	wa := access.wrapper
	router.GET("/api/access/circuit/:cid", w(wa(access.circuitPermissions)))
	router.POST("/api/access/circuit/:cid/user", w(wa(access.upsertUserPermission)))
	router.POST("/api/access/circuit/:cid/link", w(wa(access.upsertLinkPermission)))
	router.POST("/api/access/circuit/:cid/user/:uid/delete", w(wa(access.deleteUserPermission)))
	router.POST("/api/access/circuit/:cid/link/:lid/delete", w(wa(access.deleteLinkPermission)))
}
