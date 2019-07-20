package google

import (
	"encoding/json"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
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
	engine.GET("/auth/google", func(c *gin.Context) { g.redirectHandler(c) })
	engine.GET("/auth/google_login", func(c *gin.Context) { g.loginHandler(c) })
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

func (g authenticationMethod) loginHandler(c *gin.Context) {
	state := utils.RandToken(32)
	session := sessions.Default(c)
	session.Set("state", state)
	log.Printf("Stored session: %v\n", state)
	session.Save()
	link := g.oauth2Config.AuthCodeURL(state)
	c.Redirect(http.StatusFound, link)
}

// AuthHandler handles authentication of a user and initiates a session.
func (g authenticationMethod) redirectHandler(c *gin.Context) {
	// Handle the exchange code to initiate a transport.
	session := sessions.Default(c)
	retrievedState := session.Get("state")
	queryState := c.Request.URL.Query().Get("state")
	if retrievedState != queryState {
		log.Printf("Invalid session state: retrieved: %s; Param: %s", retrievedState, queryState)
		return
	}
	code := c.Request.URL.Query().Get("code")
	tok, err := g.oauth2Config.Exchange(oauth2.NoContext, code)
	if err != nil {
		log.Println(err)
		return
	}

	// Fetch user info, We might not need this to get identifiable information
	client := g.oauth2Config.Client(oauth2.NoContext, tok)
	userinfo, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	defer userinfo.Body.Close()
	data, _ := ioutil.ReadAll(userinfo.Body)
	u := user{}
	if err = json.Unmarshal(data, &u); err != nil {
		log.Println(err)
		return
	}
	session.Set("user-id", "google_" + u.Email)
	err = session.Save()
	if err != nil {
		log.Println(err)
		return
	}

	c.Redirect(http.StatusFound, "/")
}

func (g authenticationMethod) GetLoginButton() template.HTML {
	// return `<div class="g-signin2" data-onsuccess="alert('HELLO');"></div>`
	return `<div><a class="button" href="/auth/google_login"">Sign in with Google</a></div>"`
}

func (g authenticationMethod) GetLoginHeader() template.HTML {
	// return `<script src="https://apis.google.com/js/platform.js" async defer></script>
	// 	<meta name="google-signin-client_id" content="` + g.oauth2Config.ClientID + `.apps.googleusercontent.com">`
	return ""
}
