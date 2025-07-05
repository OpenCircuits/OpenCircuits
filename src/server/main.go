package main

import (
	"context"
	"flag"
	"log"
	"net"
	"os"
	"strconv"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth/firebase"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/OpenCircuits/OpenCircuits/site/go/storage"
	"github.com/OpenCircuits/OpenCircuits/site/go/storage/gcp_datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/storage/sqlite"
	"github.com/OpenCircuits/OpenCircuits/site/go/web"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func getPort() string {
	for port := 8080; port <= 65535; port++ {
		ln, err := net.Listen("tcp", ":"+strconv.Itoa(port))
		if err == nil {
			ln.Close()
			return strconv.Itoa(port)
		}
	}
	return "8080"
}

func main() {
	var err error

	// Parse flags
	noAuthConfig := flag.Bool("no_auth", false, "Enables username-only authentication for testing and development")
	useFirebaseAuth := flag.Bool("firebase_auth", false, "Enables google sign-in API login")
	firebaseConfig := flag.String("firebase_config", "", "(Optional) The path to the firebase config file, used for authentication")
	userCsifConfig := flag.String("interface", "sqlite", "The storage interface")
	sqlitePathConfig := flag.String("sqlitePath", "sql/sqlite", "The path to the sqlite working directory")
	dsEmulatorHost := flag.String("ds_emu_host", "", "The emulator host address for cloud datastore")
	dsProjectId := flag.String("ds_emu_project_id", "", "The gcp project id for the datastore emulator")
	ipAddressConfig := flag.String("ip_address", "0.0.0.0", "IP address of server")
	portConfig := flag.String("port", "8080", "Port to serve application, use \"auto\" to select the first available port starting at 8080")
	flag.Parse()

	// Bad way of registering if we're in prod and using gcp datastore and OAuth credentials
	if os.Getenv("DATASTORE_PROJECT_ID") != "" {
		*userCsifConfig = "gcp_datastore"
		*useFirebaseAuth = true
		log.Println("Found datastore project!")
	}
	if *firebaseConfig != "" {
		*useFirebaseAuth = true
		// See https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment#local-key
		os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", *firebaseConfig)
		log.Println("Found firebase config!")
	}

	// Register authentication method
	authManager := auth.AuthenticationManager{}
	if *useFirebaseAuth {
		log.Printf("Running with firebase auth!\n")
		authManager.RegisterAuthenticationMethod(firebase.New())
	}
	if *noAuthConfig {
		log.Printf("Running with no auth!\n")
		authManager.RegisterAuthenticationMethod(auth.NewNoAuth())
	}

	// Set up the storage interface
	var userCsif interfaces.CircuitStorageInterfaceFactory
	switch *userCsifConfig {
	case "mem":
		userCsif = storage.NewMemStorageInterfaceFactory()
	case "sqlite":
		userCsif, err = sqlite.NewInterfaceFactory(*sqlitePathConfig)
		core.CheckErrorMessage(err, "Failed to load sqlite instance:")
	case "gcp_datastore_emu":
		userCsif, err = gcp_datastore.NewEmuInterfaceFactory(context.Background(), *dsProjectId, *dsEmulatorHost)
		core.CheckErrorMessage(err, "Failed to load gcp datastore emulator instance:")
	case "gcp_datastore":
		userCsif, err = gcp_datastore.NewInterfaceFactory(context.Background())
		core.CheckErrorMessage(err, "Failed to load gcp datastore instance: ")
	}

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
	web.RegisterPages(router, authManager)
	authManager.RegisterHandlers(router)
	api.RegisterRoutes(router, authManager, userCsif)

	// Check if portConfig is set to auto, if so find available port
	if *portConfig == "auto" {
		*portConfig = getPort()
	}

	router.Run(*ipAddressConfig + ":" + *portConfig)
}
