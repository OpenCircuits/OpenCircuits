package session

import (
	"log"
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/api/ot/doc"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// SessionManager keeps track of live sessions
type SessionManager struct {
	dm          *doc.DocumentManager
	sessions    map[string]Session
	sessionLock *sync.RWMutex
	sessionDone chan string
}

func NewSessionManager(dm *doc.DocumentManager) *SessionManager {
	sm := &SessionManager{
		dm:          dm,
		sessions:    make(map[string]Session),
		sessionLock: &sync.RWMutex{},
		sessionDone: make(chan string, 20),
	}

	go sm.closer()

	return sm
}

//func (sm *SessionManager) updatePerms(sessionID string) {
//	sm.sessionLock.RLock()
//	defer sm.sessionLock.RUnlock()
//	_, ok := sm.sessions[sessionID]
//	if ok {
//		// Do something to update permissions
//	}
//}

func (sm *SessionManager) closer() {
	for sid := range sm.sessionDone {
		sm.sessionLock.Lock()
		delete(sm.sessions, sid)
		sm.sessionLock.Unlock()
	}
}

// TODO: Add CSRF (CSWSH) token to handshake
var upgrader = websocket.Upgrader{}

func (sm *SessionManager) Establish(c *gin.Context) {
	circuitID := c.Param("cid")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Print("Failed to upgrade connection:", err)
		return
	}

	// Get the document
	doc, err := sm.dm.Get(circuitID)
	if err != nil {
		log.Printf("%e\n", err)
		_ = conn.Close()
		return
	}

	// Spawn the session
	s := NewSession(doc, conn, sm.sessionDone)

	// Add the session to the map
	sm.sessionLock.Lock()
	sm.sessions[s.SessionID] = s
	sm.sessionLock.Unlock()
}
