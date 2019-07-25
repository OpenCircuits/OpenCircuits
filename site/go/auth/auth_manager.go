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

// MatchToken matches a provided string with the token format of an AuthenticationMethod
func (am *AuthenticationManager) MatchToken(prefix string) *AuthenticationMethod {
	for _, ap := range am.AuthMethods {
		if ap.AuthHeaderPrefix() == prefix {
			return &ap
		}
	}
	return nil
}
