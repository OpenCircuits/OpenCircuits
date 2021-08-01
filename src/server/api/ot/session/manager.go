package session

import (
	"log"
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/api/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/api/ot/doc"
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

func (sm *SessionManager) Start(circuitID string, conn conn.Connection) error {
	// Get the document
	doc, err := sm.dm.Get(circuitID)
	if err != nil {
		log.Printf("%e\n", err)
		return err
	}

	// Spawn the session
	s := NewSession(doc, conn, sm.sessionDone)

	// Add the session to the map
	sm.sessionLock.Lock()
	sm.sessions[s.SessionID] = s
	sm.sessionLock.Unlock()

	return nil
}
