package auth

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
)

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
