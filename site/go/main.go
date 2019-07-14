package main

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth/google"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/OpenCircuits/OpenCircuits/site/go/web"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.Use(gin.Recovery())

	authManager := auth.AuthenticationManager{}
	authManager.RegisterAuthenticationMethod(google.New("./secrets/google_oauth2_config.json"))
	// For testing only
	authManager.RegisterAuthenticationMethod(auth.NewNoAuth())

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
