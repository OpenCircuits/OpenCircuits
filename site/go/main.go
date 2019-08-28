package main

import (
	"flag"
	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth/google"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model/storage"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/OpenCircuits/OpenCircuits/site/go/web"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func main() {
	// Parse flags
	googleAuthConfig := flag.String("google_auth", "", "<path-to-config>; Enables google sign-in API login")
	noAuthConfig := flag.Bool("no_auth", false, "Enables username-only authentication for testing and development")
	userCsifConfig := flag.String("interface", "sqlite", "The storage interface")
	sqliteDbPathConfig := flag.String("dbPath", "circuits.db", "The path to the database file (sqlite only)")
	flag.Parse()

	// Register authentication method
	authManager := auth.AuthenticationManager{}
	if *googleAuthConfig != "" {
		authManager.RegisterAuthenticationMethod(google.New(*googleAuthConfig))
	}
	if *noAuthConfig {
		authManager.RegisterAuthenticationMethod(auth.NewNoAuth())
	}

	// Set up the storage interface
	var userCsif interfaces.CircuitStorageInterfaceFactory
	if *userCsifConfig == "mem" {
		userCsif = &storage.MemCircuitStorageInterfaceFactory{}
	} else if *userCsifConfig == "sqlite" {
		userCsif = &storage.SqliteCircuitStorageInterfaceFactory{Path: *sqliteDbPathConfig}
	}

	// Create the example circuit storage interface
	exampleCsif := storage.NewExampleCircuitStorageInterfaceFactory("./examples/examples.json")

	// Route through Gin
	router := gin.Default()
	router.Use(gin.Recovery())

	// Generate CSRF Token...
	store := sessions.NewCookieStore([]byte(utils.RandToken(64)))
	store.Options(sessions.Options{
		Path:   "/",
		MaxAge: 60 * 60 * 24 * 7,
	})
	router.Use(sessions.Sessions("opencircuitssession", store))

	// Register pages
	web.RegisterPages(router, authManager, exampleCsif)
	authManager.RegisterHandlers(router)
	api.RegisterRoutes(router, authManager, exampleCsif, userCsif)

	// TODO: add flags for this
	router.Run("0.0.0.0:8080")
}
