package auth

import (
	"github.com/gin-gonic/gin"
)

// AuthenticationManager A simple type for managing abstract authentication methods
type AuthenticationManager struct {
	AuthMethods []AuthenticationMethod
}

// RegisterAuthenticationMethod Registers an authentication method with the manager
func (am *AuthenticationManager) RegisterAuthenticationMethod(method AuthenticationMethod) {
	am.AuthMethods = append(am.AuthMethods, method)
}

// RegisterHandlers Registers the http handlers for each of the authentication methods with a gin Engine
func (am *AuthenticationManager) RegisterHandlers(e *gin.Engine) {
	for _, ap := range am.AuthMethods {
		ap.RegisterHandlers(e)
	}
}
