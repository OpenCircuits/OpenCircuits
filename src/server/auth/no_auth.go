package auth

import (
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/gin-gonic/gin"
)

type noLoginAuthenticationProvider struct{}

// NewNoAuth Creates a new instance of the no-pw-required authentication method for testing / development
func NewNoAuth() AuthenticationMethod {
	return noLoginAuthenticationProvider{}
}

func (nl noLoginAuthenticationProvider) RegisterHandlers(engine *gin.Engine) {
}

func (nl noLoginAuthenticationProvider) ExtractIdentity(token string) (model.UserID, error) {
	if token == "" {
		return "", errors.New("user id cannot be blank in no_auth")
	}
	return model.UserID("no_auth_" + token), nil
}

func (nl noLoginAuthenticationProvider) AuthHeaderPrefix() string {
	return "no_auth"
}
