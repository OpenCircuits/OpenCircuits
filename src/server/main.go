package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"strings"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth/google"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/mem"
	"github.com/OpenCircuits/OpenCircuits/site/go/launch"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/web"
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

func toEnvName(name string) string {
	return os.Getenv("OC_" + strings.ToUpper(name))
}

// Read values from CLI flags, then env vars, then hard-coded defaults

func addFlagUint64(name string, value uint64, usage string) *uint64 {
	if env := toEnvName(name); len(env) > 0 {
		if val, err := strconv.ParseUint(env, 10, 64); err == nil {
			value = val
		} else {
			log.Printf("Failed to parse parameter provided by env var: %s => %s.  Using fallback %d\n", name, usage, value)
		}
	}
	return flag.Uint64(name, value, usage)
}

func addFlagBool(name string, value bool, usage string) *bool {
	if env := toEnvName(name); len(env) > 0 {
		if val, err := strconv.ParseBool(env); err == nil {
			value = val
		} else {
			log.Printf("Failed to parse parameter provided by env var: %s => %s.  Using fallback %t\n", name, usage, value)
		}
	}
	return flag.Bool(name, value, usage)
}

func addFlagString(name string, value string, usage string) *string {
	if env := toEnvName(name); len(env) > 0 {
		value = env
	}
	return flag.String(name, value, usage)
}

// main parses inputs from the CLI and environment args and launches the server
func main() {
	var err error

	// Parse flags
	noAuthConfig := addFlagBool("no_auth", false, "Enables username-only authentication for testing and development")
	googleAuthConfig := addFlagString("google_auth", "", "<path-to-config>; Enables google sign-in API login")
	storageInterface := addFlagString("interface", "mem", "The storage interface")
	dsEmulatorHost := addFlagString("ds_emu_host", "", "The emulator host address for cloud datastore")
	dsProjectId := addFlagString("ds_emu_project_id", "", "The gcp project id for the datastore emulator")
	ipAddressConfig := addFlagString("ip_address", "0.0.0.0", "IP address of server")
	portConfig := addFlagUint64("port", 8080, "Port to serve application, use \"0\" to select the first available port starting at 8080")
	flag.Parse()

	// Register authentication method(s)
	authManager := auth.AuthenticationManager{}
	if *noAuthConfig {
		authManager.RegisterAuthenticationMethod(auth.NewNoAuth())
		fmt.Println("Using noauth")
	}
	if *googleAuthConfig != "" {
		authManager.RegisterAuthenticationMethod(google.New(*googleAuthConfig))
		fmt.Println("Using google auth")
	}

	// Always register anon auth for circuits shared publicly
	authManager.RegisterAuthenticationMethod(auth.NewAnonAuth())
	fmt.Println("Using anon auth")

	// Set up the storage interface
	var circuitDBFactory model.CircuitDBFactory
	if *storageInterface == "mem" {
		circuitDBFactory = mem.NewCircuitDB("/tmp/OpenCircuits_Circuits.json")
		fmt.Println("Using mem database")
	} else if *storageInterface == "gcp_datastore_emu" {
		circuitDBFactory, err = datastore.NewEmuCircuitDBFactory(context.Background(), *dsProjectId, *dsEmulatorHost)
		core.CheckErrorMessage(err, "Failed to load gcp datastore emulator instance:")
		fmt.Println("Using GCP emulator database")
	} else if *storageInterface == "gcp_datastore" {
		circuitDBFactory, err = datastore.NewCircuitDBFactory(context.Background())
		core.CheckErrorMessage(err, "Failed to load gcp datastore instance: ")
		fmt.Println("Using GCP production database")
	}

	// Check if portConfig is set to auto, if so find available port
	if *portConfig == 0 {
		*portConfig = uint64(getPort())
	}

	server := launch.PreLaunch(*ipAddressConfig + ":" + strconv.FormatUint(*portConfig, 10))
	web.RegisterPages(server.Router())
	api.RegisterRoutes(server.Router(), circuitDBFactory, authManager)
	server.Launch()
}
