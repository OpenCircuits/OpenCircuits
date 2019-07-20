package auth

import (
	"github.com/gin-gonic/gin"
	"html/template"
)

// AuthenticationMethod An interface for authentication methods to plug into the router and the web page
type AuthenticationMethod interface {
	// Register any handlers required for handling the user's auth
	RegisterHandlers(*gin.Engine)
	// Injects a "login" prompt / button into the "login methods" popup
	GetLoginButton() template.HTML
	// Injects into the "head" of the HTML any scripts or meta info
	GetLoginHeader() template.HTML
}
