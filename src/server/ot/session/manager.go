package session

import (
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
)

// SessionManager launches sessions
type SessionManager struct {
	dm          doc.DocumentManager
	sessionDone chan model.SessionID
}

func NewSessionManager(dm doc.DocumentManager) *SessionManager {
	sm := &SessionManager{
		dm:          dm,
		sessionDone: make(chan model.SessionID, 20),
	}

	return sm
}

func (sm *SessionManager) doneSender(sessionID model.SessionID) {
	sm.sessionDone <- sessionID
}

func (sm *SessionManager) Start(circuitID model.CircuitId, conn conn.Connection) error {
	// Get the document
	doc, err := sm.dm.Get(circuitID)
	if err != nil {
		log.Printf("%v\n", err)
		return err
	}

	// Spawn the session
	_ = NewSession(doc, conn, sm.doneSender)
	return nil
}
