package auth

import (
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
	"html/template"
	"log"
	"net/http"
)

type noLoginAuthenticationProvider struct {
}

// NewNoAuth Creates a new instance of the no-pw-required authentication method for testing / development
func NewNoAuth() AuthenticationMethod {
	return &noLoginAuthenticationProvider{}
}

func (nl noLoginAuthenticationProvider) RegisterHandlers(engine *gin.Engine) {
	engine.GET("/auth/noauth/:uid", func(c *gin.Context) {
		// Handle the exchange code to initiate a transport.
		session := sessions.Default(c)
		session.Set("user-id", "untrusted_"+c.Param("uid"))
		err := session.Save()
		if err != nil {
			log.Println(err)
			return
		}

		c.Redirect(http.StatusFound, "/")
	})
}

func (nl noLoginAuthenticationProvider) GetLoginButton() template.HTML {
	return `
<div>
	<a class="button" onclick="onNoAuthSubmit()">NoAuth Login</a>
</div>
<div>
	<input id="no-auth-user-input" type="text" placeholder="username"/>
</div>`
}

func (nl noLoginAuthenticationProvider) GetLoginHeader() template.HTML {
	return `
<script type="application/javascript">
function onNoAuthSubmit() {
	let val = document.getElementById('no-auth-user-input').value;
	if (val === "") {
		alert("Username must not be blank!");
		return;
	}
	window.location = '/auth/noauth/' + val;
}
</script>`
}
