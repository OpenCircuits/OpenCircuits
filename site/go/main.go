package main

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/web"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	web.RegisterPages(router)

	router.Run("127.0.0.1:9090")
}
