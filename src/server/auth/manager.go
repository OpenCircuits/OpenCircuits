package auth

import (
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

// AuthenticationMethod An interface for authentication methods to plug into the router and the web page
type AuthenticationMethod interface {
	// Takes an authorization token and extracts the user's identity from it (a simple string user id for now)
	ExtractIdentity(string) (model.UserID, error)
	// The prefix used to the actual token in the authorization header
	AuthHeaderPrefix() string
}

// AuthenticationManager A simple type for managing abstract authentication methods
type AuthenticationManager struct {
	AuthMethods []AuthenticationMethod
}

// RegisterAuthenticationMethod Registers an authentication method with the manager
func (am *AuthenticationManager) RegisterAuthenticationMethod(method AuthenticationMethod) {
	am.AuthMethods = append(am.AuthMethods, method)
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

// ExtractIdentity checks if the user is who they say they are and returns their identity
func (am *AuthenticationManager) ExtractIdentity(prefix, id string) (model.UserID, error) {
	method := am.MatchToken(prefix)
	if method == nil {
		return "", errors.New("unsupported or invalid authentication type")
	}
	return (*method).ExtractIdentity(id)
}
