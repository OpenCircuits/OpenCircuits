package main

import (
	"context"
	"flag"
	"log"
	"net"
	"os"
	"strconv"
	"strings"

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

func getPort() int {
	for port := 8080; port <= 65535; port++ {
		ln, err := net.Listen("tcp", ":"+strconv.Itoa(port))
		if err == nil {
			ln.Close()
			return port
		}
	}
	return 8080
}

func getOCEnv(name string) string {
	return os.Getenv("OC_" + strings.ToUpper(name))
}

// Read values from CLI flags, then env vars, then hard-coded defaults

func addFlagUint64(name string, value uint64, usage string) *uint64 {
	if env := getOCEnv(name); len(env) > 0 {
		if val, err := strconv.ParseUint(env, 10, 64); err == nil {
			value = val
		} else {
			log.Printf("Failed to parse parameter provided by env var: %s => %s.  Using fallback %d\n", name, usage, value)
		}
	}
	return flag.Uint64(name, value, usage)
}

func addFlagBool(name string, value bool, usage string) *bool {
	if env := getOCEnv(name); len(env) > 0 {
		if val, err := strconv.ParseBool(env); err == nil {
			value = val
		} else {
			log.Printf("Failed to parse parameter provided by env var: %s => %s.  Using fallback %t\n", name, usage, value)
		}
	}
	return flag.Bool(name, value, usage)
}

func addFlagString(name string, value string, usage string) *string {
	if env := getOCEnv(name); len(env) > 0 {
		value = env
	}
	return flag.String(name, value, usage)
}

func main() {
	var err error

	noAuthConfig := addFlagBool("no_auth", false, "Enables username-only authentication for testing and development")
	googleAuthConfig := addFlagString("google_auth", "", "<path-to-config>; Enables google sign-in API login")
	userCsifConfig := addFlagString("interface", "sqlite", "The storage interface")
	sqlitePathConfig := addFlagString("sqlitePath", "sql/sqlite", "The path to the sqlite working directory")
	dsEmulatorHost := addFlagString("ds_emu_host", "", "The emulator host address for cloud datastore")
	dsProjectId := addFlagString("ds_emu_project_id", "", "The gcp project id for the datastore emulator")
	ipAddressConfig := addFlagString("ip_address", "0.0.0.0", "IP address of server")
	portConfig := addFlagUint64("port", 8080, "Port to serve application, use \"0\" to select the first available port starting at 8080")
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

	// Check if portConfig is set to auto, if so find available port
	if *portConfig == 0 {
		*portConfig = uint64(getPort())
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

	router.Run(*ipAddressConfig + ":" + strconv.FormatUint(*portConfig, 10))
}
