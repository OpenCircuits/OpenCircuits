package auth

import (
	"errors"

	"github.com/gin-gonic/gin"
)

type noLoginAuthenticationProvider struct {
}

// NewNoAuth Creates a new instance of the no-pw-required authentication method for testing / development
func NewNoAuth() AuthenticationMethod {
	return &noLoginAuthenticationProvider{}
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
