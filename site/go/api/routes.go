package api

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	// TODO: api versioning
	router.GET("/api/circuits/:id", CircuitLoadHandler)
	router.GET("/api/circuits", CircuitQueryHandler)
	router.POST("/api/circuits", CircuitCreateHandler)
	router.PUT("/api/circuits/:id", CircuitStoreHandler)
}
