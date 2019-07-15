package auth

import (
	"github.com/gin-gonic/gin"
)

type AuthenticationManager struct {
	AuthMethods []AuthenticationMethod
}

func (am *AuthenticationManager) RegisterAuthenticationMethod(method AuthenticationMethod) {
	am.AuthMethods = append(am.AuthMethods, method)
}

func (am *AuthenticationManager) RegisterHandlers(e *gin.Engine) {
	for _, ap := range am.AuthMethods {
		ap.RegisterHandlers(e)
	}
}
