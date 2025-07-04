package google

import (
	"context"
	"log"

	firebase "firebase.google.com/go"
	firebaseAuth "firebase.google.com/go/auth"

	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/gin-gonic/gin"
)

type authenticationMethod struct {
	client *firebaseAuth.Client
}

func (g authenticationMethod) RegisterHandlers(engine *gin.Engine) {
}

// New Creates a new instance of the google authentication method with the provided config path
func New() auth.AuthenticationMethod {
	app, err := firebase.NewApp(context.Background(), nil)
	if err != nil {
		log.Printf("error initializing Firebase: %v\n", err)
		panic(err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	return authenticationMethod{
		client: client,
	}
}

func (g authenticationMethod) ExtractIdentity(token string) (string, error) {
	tokenInfo, err := g.client.VerifyIDToken(context.Background(), token)
	if err != nil {
		log.Printf("Error verifying token '%s': %v\n", token, err)
		return "", err
	}

	if tokenInfo.Firebase.SignInProvider != "google.com" {
		log.Printf("Error authenticating, sign-in provider is not google.com! Provider: '%s'\n", tokenInfo.Firebase.SignInProvider)
	}

	// We must extract the google identity (rather than tokenInfo.UID) so that old users
	// don't lose access to all of their circuits.
	// TODO: Migrate to tokenInfo.UID at some point
	googleIdentities := tokenInfo.Firebase.Identities[tokenInfo.Firebase.SignInProvider].([]interface{})
	googleId := googleIdentities[0].(string)

	return "google_" + googleId, nil
}

func (g authenticationMethod) AuthHeaderPrefix() string {
	return "google"
}
