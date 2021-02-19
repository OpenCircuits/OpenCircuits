package auth

import (
	"github.com/gin-gonic/gin"
)

// AuthenticationMethod An interface for authentication methods to plug into the router and the web page
type AuthenticationMethod interface {
	// Register any handlers required for handling the user's authentication.  Note: for externally-authenticated
	//	methods, this may not be required
	RegisterHandlers(*gin.Engine)
	// Takes an authorization token and extracts the user's identity from it (a simple string user id for now)
	ExtractIdentity(string) (string, error)
	// The prefix used to the actual token in the authorization header
	AuthHeaderPrefix() string
}
