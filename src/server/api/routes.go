package api

import (
	"fmt"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
	"net/http"
)

func authenticatedHandler(manager auth.AuthenticationManager, handler func(_ *gin.Context, _ model.UserId)) func(c *gin.Context) {
	return func(c *gin.Context) {
		am := manager.MatchToken(c.GetHeader("authType"))
		if am == nil {
			c.JSON(http.StatusBadRequest, struct {
				message string
			}{
				message: "Cannot call authenticated route without valid authentication header",
			})
			return
		}
		id, err := (*am).ExtractIdentity(c.GetHeader("authId"))
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

func RegisterRoutes(router *gin.Engine, manager auth.AuthenticationManager, exampleCsif interfaces.CircuitStorageInterfaceFactory, userCsif interfaces.CircuitStorageInterfaceFactory) {
	// TODO: api versioning
	router.GET("/api/ping", authenticatedHandler(manager, pingHandler))
	router.GET("/api/example/:id", getExampleCircuitHandler(exampleCsif))

	// User-saveable circuits
	router.GET("/api/circuits/:id", authenticatedHandler(manager, circuitHandler(userCsif, circuitLoadHandler)))
	router.GET("/api/circuits", authenticatedHandler(manager, circuitHandler(userCsif, circuitQueryHandler)))
	router.POST("/api/circuits", authenticatedHandler(manager, circuitHandler(userCsif, circuitCreateHandler)))
	router.PUT("/api/circuits/:id", authenticatedHandler(manager, circuitHandler(userCsif, circuitStoreHandler)))
	router.POST("/api/circuits/:id/delete", authenticatedHandler(manager, circuitHandler(userCsif, circuitDeleteHandler)))
}
