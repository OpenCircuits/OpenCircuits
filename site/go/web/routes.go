package web

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
)

// RegisterPages Registers the web-page-serving routes
func RegisterPages(router *gin.Engine, authManager auth.AuthenticationManager) {
	router.LoadHTMLGlob("./templates/*")

	router.Static("/css", "./css")
	router.Static("/img", "./img")
	router.Static("/ts", "./ts")
	router.StaticFile("/Bundle.js", "./Bundle.js")
	router.StaticFile("/Bundle.js.map", "./Bundle.js.map")

	// TODO: this is a hack to get bundles not not cache
	router.GET("/Bundle.js?ver=:id", noCacheHandler("./Bundle.js"))

	router.GET("/", func(c *gin.Context) { indexHandler(c, authManager) })
}
