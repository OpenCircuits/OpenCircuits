package google

import (
	"encoding/json"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"html/template"
	"io/ioutil"
	"log"
)

type authenticationMethod struct {
	oauth2Config oauth2.Config
}

// User is a retrieved and authenticated user.
type user struct {
	Sub           string `json:"sub"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Profile       string `json:"profile"`
	Picture       string `json:"picture"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Gender        string `json:"gender"`
}

// Credentials which stores google ids.
type oAuth2Config struct {
	ID          string `json:"id"`
	Secret      string `json:"secret"`
	RedirectURL string `json:"redirectURL"`
}

func (g authenticationMethod) RegisterHandlers(engine *gin.Engine) {
}

// New Creates a new instance of the google authentication method with the provided config path
func New(configPath string) auth.AuthenticationMethod {
	file, err := ioutil.ReadFile(configPath)
	if err != nil {
		log.Printf("File error: %v\n", err)
		panic(err)
	}

	var cred oAuth2Config
	err = json.Unmarshal(file, &cred)
	if err != nil {
		log.Printf("Error unmarshalling credentials json: %v\n", err)
		panic(err)
	}

	return authenticationMethod{
		oauth2Config: oauth2.Config{
			ClientID:     cred.ID,
			ClientSecret: cred.Secret,
			RedirectURL:  cred.RedirectURL,
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
			},
			Endpoint: google.Endpoint,
		},
	}
}

func (g authenticationMethod) ExtractIdentity(token string) (string, error) {
	// TODO: real stuff with google
	return "google auth token " + token, nil
}

func (g authenticationMethod) AuthHeaderPrefix() string {
	return "google"
}

func (g authenticationMethod) GetLoginButton() template.HTML {
	return `<div id="login-popup-google-signin"></div>`
}

func (g authenticationMethod) GetLoginHeader() template.HTML {
	return template.HTML(`
<meta name="google-signin-client_id" content="` + g.oauth2Config.ClientID + `">
<script>
	function gapiLoaded() {
		window.onGapiLoad();
	}
</script>
<script src="https://apis.google.com/js/platform.js?onload=gapiLoaded" async defer></script>`)
}
