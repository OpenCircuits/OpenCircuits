package launch

import (
	"math/rand"

	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

// ServerLaunchData holds instances of the types necessary to run the server.
type ServerLaunchData struct {
	addr   string
	router *gin.Engine
}

func PreLaunch(addr string) ServerLaunchData {
	// Route through Gin
	s := ServerLaunchData{
		addr:   addr,
		router: gin.Default(),
	}
	s.router.Use(gin.Recovery())

	// Generate CSRF Token...
	key := make([]byte, 64)
	n, err := rand.Read(key)
	if n != 64 || err != nil {
		panic(err)
	}
	store := sessions.NewCookieStore(key)
	store.Options(sessions.Options{
		Path:   "/",
		MaxAge: 60 * 60 * 24 * 7,
	})
	s.router.Use(sessions.Sessions("opencircuitssession", store))

	return s
}

func (s ServerLaunchData) Router() *gin.Engine {
	return s.router
}

func (s ServerLaunchData) Launch() {
	s.router.Run(s.addr)
}
