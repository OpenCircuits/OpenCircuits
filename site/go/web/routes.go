package web

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/auth"
	"github.com/gin-gonic/gin"
)

func RegisterPages(router* gin.Engine) {
	router.LoadHTMLGlob("./templates/*")

	router.Static("/css", "./css")
	router.Static("/img", "./img")
	router.Static("/ts", "./ts")
	router.StaticFile("/Bundle.js", "./Bundle.js")

	router.GET("/", IndexHandler)

	// TODO: separate the auth handlers from the core auth module
	router.GET("/auth", auth.RedirectHandler)
	router.GET("/login", auth.LoginHandler)
}
