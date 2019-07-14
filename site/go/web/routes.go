package web

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
)

func RegisterPages(router *gin.Engine, authManager auth.AuthenticationManager) {
	router.LoadHTMLGlob("./templates/*")

	router.Static("/css", "./css")
	router.Static("/img", "./img")
	router.Static("/ts", "./ts")
	router.StaticFile("/Bundle.js", "./Bundle.js")

	router.GET("/", func(c *gin.Context) { IndexHandler(c, authManager) })
}
