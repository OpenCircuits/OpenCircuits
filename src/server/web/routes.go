package web

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
)

// RegisterPages Registers the web-page-serving routes
func RegisterPages(router *gin.Engine, authManager auth.AuthenticationManager) {
	router.Static("/assets", "./site/assets")
	router.Static("/img", "./site/img")
	router.Static("/static", "./site/static")
	router.Static("/examples", "./site/examples")

	router.LoadHTMLFiles("./site/index.html")
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})

	router.StaticFile("/robots.txt", "./site/robots.txt")
}
