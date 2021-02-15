package web

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
)

// RegisterPages Registers the web-page-serving routes
func RegisterPages(router *gin.Engine, authManager auth.AuthenticationManager) {
	router.Static("/assets", "./site/assets")
	router.Static("/img", "./site/img")
	router.Static("/static", "./site/static")

	router.StaticFile("/", "./site/index.html")
	router.StaticFile("/robots.txt", "./site/robots.txt")
}
