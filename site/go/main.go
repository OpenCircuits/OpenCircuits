package main

import (
	"flag"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth/google"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/OpenCircuits/OpenCircuits/site/go/web"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func main() {
	googleAuthConfig := flag.String("google_auth", "disabled", "disabled|<path-to-config>; Enables google sign-in API login")
	noAuthConfig := flag.String("no_auth", "disabled", "disabled|enabled; Enables username-only authentication for testing and development")
	flag.Parse()

	authManager := auth.AuthenticationManager{}

	if *googleAuthConfig != "disabled" {
		authManager.RegisterAuthenticationMethod(google.New(*googleAuthConfig))
	}
	if *noAuthConfig == "enabled" {
		authManager.RegisterAuthenticationMethod(auth.NewNoAuth())
	}

	router := gin.Default()
	router.Use(gin.Recovery())

	// Generate CSRF Token...
	store := sessions.NewCookieStore([]byte(utils.RandToken(64)))
	store.Options(sessions.Options{
		Path:   "/",
		MaxAge: 60 * 60 * 24 * 7,
	})
	router.Use(sessions.Sessions("opencircuitssession", store))

	web.RegisterPages(router, authManager)
	authManager.RegisterHandlers(router)

	// TODO: add flags for this
	router.Run("127.0.0.1:8080")
}
