package api

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	// TODO: api versioning
	router.GET("/api/circuit/:id", CircuitLoadHandler)
	router.GET("/api/circuits", CircuitQueryHandler)
	router.POST("/api/circuit/:id", CircuitStoreHandler)
}
