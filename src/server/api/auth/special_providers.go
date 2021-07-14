package auth

import (
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
)

type noLoginAuthenticationProvider struct{}

// NewNoAuth Creates a new instance of the no-pw-required authentication method for testing / development
func NewNoAuth() AuthenticationMethod {
	return noLoginAuthenticationProvider{}
}

func (nl noLoginAuthenticationProvider) RegisterHandlers(engine *gin.Engine) {
}

func (nl noLoginAuthenticationProvider) ExtractIdentity(token string) (string, error) {
	if token == "" {
		return "", errors.New("user id cannot be blank in no_auth")
	}
	return "no_auth_" + token, nil
}

func (nl noLoginAuthenticationProvider) AuthHeaderPrefix() string {
	return "no_auth"
}

type anonAuthMethod struct{}

// NewAnonAuth Creates a new instance of the authentication method for user who aren't logged in
func NewAnonAuth() AuthenticationMethod {
	return anonAuthMethod{}
}

func (anonAuthMethod) RegisterHandlers(*gin.Engine) {}
func (anonAuthMethod) ExtractIdentity(string) (string, error) {
	return model.AnonUserID, nil
}

func (anonAuthMethod) AuthHeaderPrefix() string {
	return "anon"
}
