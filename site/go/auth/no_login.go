package auth

import (
	"github.com/gin-gonic/gin"
	"html/template"
)

// A no-pw-required authentication provider for testing and other purposes
type noLoginAuthenticationProvider struct {
}

func NewNoAuth() AuthenticationMethod {
	return &noLoginAuthenticationProvider{}
}

func (nl noLoginAuthenticationProvider) RegisterHandlers(engine *gin.Engine) {
	engine.GET("/auth/noauth/:uid", func(c *gin.Context) {
		c.Set("user-id", "untrusted_" + c.Param("uid"))
	})
}

func (nl noLoginAuthenticationProvider) GetLoginButton() template.HTML {
	// TODO: this needs a textbox / popup too
	return `<div><a class="button" href="/auth/noauth">NoAuth Login</a></div>`
}

func (nl noLoginAuthenticationProvider) GetLoginHeader() template.HTML {
	return ""
}
