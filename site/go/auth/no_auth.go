package auth

import (
	"errors"
	"github.com/gin-gonic/gin"
	"html/template"
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
	return "no auth user " + token, nil
}

func (nl noLoginAuthenticationProvider) AuthHeaderPrefix() string {
	return "no_auth"
}

func (nl noLoginAuthenticationProvider) GetLoginButton() template.HTML {
	return `
<div class="login__popup__label">NoAuth Login</div>
<div><input id="no-auth-user-input" type="text" placeholder="username"/></div>
<button onclick="onNoAuthSubmit()">Submit</button>`
}

func (nl noLoginAuthenticationProvider) GetLoginHeader() template.HTML {
	return `
<meta id="no_auth_enable" content="true">
<script type="application/javascript">
function onNoAuthSubmit() {
	let val = document.getElementById('no-auth-user-input').value;
	onNoAuthSubmitted(val);
}
</script>`
}
