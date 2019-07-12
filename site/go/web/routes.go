package web

import (
	"github.com/gin-gonic/gin"
)

func RegisterPages(router* gin.Engine) {
	router.LoadHTMLGlob("./templates/*")

	router.Static("/css", "./css")
	router.Static("/img", "./img")
	router.Static("/ts", "./ts")
	router.StaticFile("/Bundle.js", "./Bundle.js")
	router.StaticFile("/Bundle.js.map", "./Bundle.js.map")

	// TODO: this is a hack to get bundles not not cache
	router.GET("/bundle/:id", NoCacheHandler("/Bundle.js"))

	router.GET("/", IndexHandler)
}
