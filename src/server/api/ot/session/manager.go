package session

import (
	"log"
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/api/ot/doc"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// SessionManager keeps track of live sessions
type SessionManager struct {
	dm          *doc.DocumentManager
	sessions    map[SessionID]*Session
	sessionLock *sync.RWMutex
	addSession  chan *Session
	sessionDone chan SessionID
}

func NewSessionManager(dm *doc.DocumentManager) *SessionManager {
	sm := &SessionManager{
		dm:          dm,
		sessions:    make(map[SessionID]*Session),
		addSession:  make(chan *Session),
		sessionLock: &sync.RWMutex{},
		sessionDone: make(chan SessionID, 20),
	}

	go sm.manager()

	return sm
}

func (sm *SessionManager) updatePerms(sessionID SessionID) {
	sm.sessionLock.RLock()
	_, ok := sm.sessions[sessionID]
	sm.sessionLock.RUnlock()
	if ok {
		// Do something to update permissions
	}
}

func (sm *SessionManager) manager() {
	// Add sessions in a single thread because session IDs need to be unique
	for {
		select {
		case s := <-sm.addSession:

			// Generate a unique ID for the session
			var sid SessionID
			for {
				// Session IDs should be long enough where someone won't randomly guess one
				sid = SessionID{utils.RandToken(64)}
				if _, ok := sm.sessions[sid]; !ok {
					break
				}
			}

			// start the session
			s.start()

			// Add the session to the map
			sm.sessionLock.Lock()
			sm.sessions[s.SessionID] = s
			sm.sessionLock.Unlock()

		case sid := <-sm.sessionDone:
			sm.sessionLock.Lock()
			delete(sm.sessions, sid)
			sm.sessionLock.Unlock()
		}
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
	ch, err := sm.dm.Get(circuitID)
	if err != nil {
		log.Printf("%e\n", err)
		_ = conn.Close()
		return
	}

	// Add the session
	sm.addSession <- &Session{
		CircuitID:  circuitID,
		conn:       conn,
		done:       sm.sessionDone,
		docUpdates: make(chan interface{}, 20),
		doc:        ch,
	}
}
