package web

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/gin-gonic/gin"
)

// RegisterPages Registers the web-page-serving routes
func RegisterPages(router *gin.Engine, authManager auth.AuthenticationManager, examplesCsif interfaces.CircuitStorageInterfaceFactory) {
	router.LoadHTMLGlob("./templates/*.gohtml")

	router.Static("/css", "./css")
	router.Static("/img", "./img")
	router.Static("/ts", "./ts")

	router.StaticFile("/Bundle.digital.js", "./Bundle.digital.js")
	router.StaticFile("/Bundle.digital.js.map", "./Bundle.digital.js.map")

	router.StaticFile("/Bundle.analog.js", "./Bundle.analog.js")
	router.StaticFile("/Bundle.analog.js.map", "./Bundle.analog.js.map")

	cache, err := NewDebugCache([]string{"./Bundle.digital.js", "./Bundle.analog.js"})
	core.CheckErrorMessage(err, "Failed to initialize static cache: ")
	cache.RegisterRoutes(router)

	router.GET("/", indexHandler(authManager, examplesCsif, cache))
	router.GET("/analog", analogHandler(authManager, examplesCsif, cache))

}
