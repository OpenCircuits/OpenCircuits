package web

import (
	"github.com/gin-gonic/gin"
)

// RegisterPages Registers the web-page-serving routes
func RegisterPages(router *gin.Engine) {
	router.Static("/assets", "./site/assets")
	router.Static("/img", "./site/img")
	router.Static("/static", "./site/static")
	router.Static("/examples", "./site/examples")

	router.StaticFile("/", "./site/index.html")
	router.StaticFile("/robots.txt", "./site/robots.txt")
}
