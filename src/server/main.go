package main

import (
	"context"
	"flag"
	"net"
	"os"
	"strconv"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth/google"
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

type flagVar struct {
	uFlag *uint64
	iFlag *int
	bFlag *bool
	sFlag *string
}

func createConfig(key string, message string) flagVar {
	var config flagVar
	val := os.Getenv(key)
	uintVal, errU := strconv.ParseUint(val, 10, 0)
	intVal, errI := strconv.Atoi(val)
	boolVal, errB := strconv.ParseBool(val)
	if errU == nil {
		config.uFlag = flag.Uint64(key, uintVal, message)
	} else if errI == nil {
		config.iFlag = flag.Int(key, intVal, message)
	} else if errB == nil {
		config.bFlag = flag.Bool(key, boolVal, message)
	} else {
		config.sFlag = flag.String(key, val, message)
	}
	return config
}

func main() {
	var err error

	noAuthConfig := createConfig("no_auth", "Enables username-only authentication for testing and development").bFlag
	googleAuthConfig := createConfig("google_auth", "<path-to-config>; Enables google sign-in API login").sFlag
	userCsifConfig := createConfig("interface", "The storage interface").sFlag
	sqlitePathConfig := createConfig("sqlitePath", "The path to the sqlite working directory").sFlag
	dsEmulatorHost := createConfig("ds_emu_host", "The emulator host address for cloud datastore").sFlag
	dsProjectId := createConfig("ds_emu_project_id", "The gcp project id for the datastore emulator").sFlag
	ipAddressConfig := createConfig("ip_address", "IP address of server").sFlag
	portConfig := createConfig("port", "Port to serve application, use \"auto\" to select the first available port starting at 8080").uFlag
	flag.Parse()

	// Register authentication method
	authManager := auth.AuthenticationManager{}
	if *noAuthConfig {
		authManager.RegisterAuthenticationMethod(auth.NewNoAuth())
	}
	if *googleAuthConfig != "" {
		authManager.RegisterAuthenticationMethod(google.New(*googleAuthConfig))
	}

	// Set up the storage interface
	var userCsif interfaces.CircuitStorageInterfaceFactory
	if *userCsifConfig == "mem" {
		userCsif = storage.NewMemStorageInterfaceFactory()
	} else if *userCsifConfig == "sqlite" {
		userCsif, err = sqlite.NewInterfaceFactory(*sqlitePathConfig)
		core.CheckErrorMessage(err, "Failed to load sqlite instance:")
	} else if *userCsifConfig == "gcp_datastore_emu" {
		userCsif, err = gcp_datastore.NewEmuInterfaceFactory(context.Background(), *dsProjectId, *dsEmulatorHost)
		core.CheckErrorMessage(err, "Failed to load gcp datastore emulator instance:")
	} else if *userCsifConfig == "gcp_datastore" {
		userCsif, err = gcp_datastore.NewInterfaceFactory(context.Background())
		core.CheckErrorMessage(err, "Failed to load gcp datastore instance:")
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
	if strconv.FormatUint(*portConfig, 10) == "auto" {
		os.Setenv("port", getPort())
	}

	router.Run(*ipAddressConfig + ":" + strconv.FormatUint(*portConfig, 10))
}
