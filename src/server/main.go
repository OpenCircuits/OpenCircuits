package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"net"
	"os"
	"strconv"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	api_routes "github.com/OpenCircuits/OpenCircuits/site/go/api/routes"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth/google"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/drivers/gcp_datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/drivers/mem"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
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
	googleAuthConfig := flag.String("google_auth", "", "<path-to-config>; Enables google sign-in API login")
	noAuthConfig := flag.Bool("no_auth", false, "Enables username-only authentication for testing and development")
	userCsifConfig := flag.String("interface", "mem", "The storage interface")
	dsEmulatorHost := flag.String("ds_emu_host", "", "The emulator host address for cloud datastore")
	dsProjectId := flag.String("ds_emu_project_id", "", "The gcp project id for the datastore emulator")
	ipAddressConfig := flag.String("ip_address", "0.0.0.0", "IP address of server")
	portConfig := flag.String("port", "8080", "Port to serve application, use \"auto\" to select the first available port starting at 8080")
	flag.Parse()

	// Bad way of registering if we're in prod and using gcp datastore and OAuth credentials
	if os.Getenv("DATASTORE_PROJECT_ID") != "" {
		*googleAuthConfig = "credentials.json"
		*userCsifConfig = "gcp_datastore"
	}

	// Register authentication method
	authManager := auth.AuthenticationManager{}
	if *googleAuthConfig != "" {
		authManager.RegisterAuthenticationMethod(google.New(*googleAuthConfig))
		fmt.Println("Using google auth")
	}
	if *noAuthConfig {
		authManager.RegisterAuthenticationMethod(auth.NewNoAuth())
		fmt.Println("Using noauth")
	}
	authManager.RegisterAuthenticationMethod(auth.NewAnonAuth())
	fmt.Println("Using anon auth")

	// Set up the storage interface
	var userCsif model.CircuitStorageInterfaceFactory
	if *userCsifConfig == "mem" {
		userCsif = mem.NewInterfaceFactory()
	} else if *userCsifConfig == "gcp_datastore_emu" {
		userCsif, err = gcp_datastore.NewEmuInterfaceFactory(context.Background(), *dsProjectId, *dsEmulatorHost)
		core.CheckErrorMessage(err, "Failed to load gcp datastore emulator instance:")
	} else if *userCsifConfig == "gcp_datastore" {
		userCsif, err = gcp_datastore.NewInterfaceFactory(context.Background())
		core.CheckErrorMessage(err, "Failed to load gcp datastore instance: ")
	}

	// Route through Gin
	router := gin.Default()
	router.Use(gin.Recovery())

	// Generate CSRF Token...
	key := make([]byte, 64)
	n, err := rand.Read(key)
	if n != 64 || err != nil {
		panic(err)
	}
	store := sessions.NewCookieStore(key)
	store.Options(sessions.Options{
		Path:   "/",
		MaxAge: 60 * 60 * 24 * 7,
	})
	router.Use(sessions.Sessions("opencircuitssession", store))

	// Setup authorization middleware
	router.Use(api.AuthMiddleware(authManager))

	// Register routes
	web.RegisterPages(router)
	api_routes.RegisterRoutes(router, userCsif, mem.NewAccess())

	// Check if portConfig is set to auto, if so find available port
	if *portConfig == "auto" {
		*portConfig = getPort()
	}

	router.Run(*ipAddressConfig + ":" + *portConfig)
}
