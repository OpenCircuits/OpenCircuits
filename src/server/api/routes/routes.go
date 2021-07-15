package routes

import (
	"fmt"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/routes/circuits"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/gin-gonic/gin"
)

func pingHandler(c *gin.Context) {
	userId := c.Request.Header.Get(api.Identity)
	c.JSON(http.StatusOK, fmt.Sprintf("Thank you for pinging: %s", userId))
}

func RegisterRoutes(router *gin.Engine, userCsif interfaces.CircuitStorageInterfaceFactory) {
	router.GET("/api/ping", pingHandler)

	w := func(h api.HandlerFunc) gin.HandlerFunc {
		return api.Wrap(userCsif, h)
	}

	// User-saveable circuits
	router.GET("/api/circuits/:id", w(circuits.Load))
	router.GET("/api/circuits", w(circuits.Query))
	router.POST("/api/circuits", w(circuits.Create))
	router.PUT("/api/circuits/:id", w(circuits.Store))
	router.POST("/api/circuits/:id/delete", w(circuits.Delete))
}
