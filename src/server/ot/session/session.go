package session

import (
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
)

type sessionState struct {
	sessionID  string
	conn       conn.Connection
	done       chan<- string
	docUpdates chan interface{}
	doc        doc.Document
	// TODO Add cached permissions, which can be updated
	// perms   chan UserPermissions
}

type Session struct {
	SessionID string
}

func NewSession(doc doc.Document, conn conn.Connection, done chan<- string) Session {
	s := sessionState{
		sessionID:  utils.RandToken(128),
		conn:       conn,
		done:       done,
		docUpdates: make(chan interface{}, 64),
		doc:        doc,
	}

	go s.networkListener()
	go s.networkSender()

	return Session{
		SessionID: s.sessionID,
	}
}

func (s sessionState) sendDoc(v interface{}) {
	s.doc.Send(doc.MessageWrapper{
		SessionID: s.sessionID,
		Resp:      s.docUpdates,
		Data:      v,
	})
}

func (s sessionState) close() {
	s.done <- s.sessionID
	s.conn.Close()
	s.sendDoc(doc.LeaveDocument{})
	close(s.docUpdates)
}

// networkListener is the main loop of the session
func (s sessionState) networkListener() {
	defer s.close()

	// This can be synchronous because it is per-client
	for rawMsg := range s.conn.Recv() {
		msg, err := Deserialize(rawMsg)
		if err != nil {
			// Client sent a bad message, so close the session
			log.Println("client sent a bad message: ", err)
			break
		}

		s.sendDoc(msg)
	}
}

// networkSender guarantees messages are sent to the client in the correct
//	order by sending from a single thread.
func (s sessionState) networkSender() {
	for u := range s.docUpdates {
		// TODO: Send one-at-a-time until the session takes rapid accepted entries
		//	and bundle them into a single message
		if a, ok := u.(doc.AcceptedEntry); ok {
			u = NewEntries{
				Entries: []doc.AcceptedEntry{a},
			}
		}

		m := Serialize(u)
		s.conn.Send(m)
	}
}
