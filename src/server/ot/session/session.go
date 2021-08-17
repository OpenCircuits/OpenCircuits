package session

import (
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
)

type SessionDone = func(model.SessionID)

type sessionState struct {
	sessionID  model.SessionID
	conn       conn.Connection
	done       SessionDone
	docUpdates chan interface{}
	doc        doc.Document
	// TODO Add cached permissions, which can be updated
	// perms   chan UserPermissions
}

type Session struct {
	SessionID model.SessionID
}

func NewSession(doc doc.Document, conn conn.Connection, done SessionDone) Session {
	s := sessionState{
		sessionID:  utils.RandToken(32),
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
		Resp: s.docUpdates,
		Data: v,
	})
}

func (s sessionState) close() {
	s.done(s.sessionID)
	s.conn.Close()
	s.sendDoc(doc.LeaveDocument{})
	close(s.docUpdates)
}

// networkListener is the main loop of the session
func (s sessionState) networkListener() {
	defer s.close()

	userID := ""

	// This can be synchronous because it is per-client
	for msg := range s.conn.Recv() {
		switch msg := msg.(type) {
		case conn.ProposeEntry:
			// User cannot propose until they have joined
			if len(userID) == 0 {
				break
			}
			// TODO: Access check will be done here
			s.sendDoc(doc.ProposeEntry{
				Action:        msg.Action,
				ProposedClock: msg.ProposedClock,
				SchemaVersion: msg.SchemaVersion,
				UserID:        userID,
				SessionID:     s.sessionID,
			})
		case conn.JoinDocument:
			// User must create a new session to re-join
			if len(userID) != 0 {
				break
			}
			// TODO: Authentication check will be done here
			userID = msg.AuthID
			s.sendDoc(doc.JoinDocument{
				LogClock: msg.LogClock,
			})
		default:
			log.Println("Session received unexpected message type from client")
		}
	}
}

// networkSender guarantees messages are sent to the client in the correct
//	order by sending from a single thread.
func (s sessionState) networkSender() {
	for u := range s.docUpdates {
		switch u := u.(type) {
		case doc.NewEntry:
			// TODO: Send one-at-a-time until the session takes rapid accepted entries
			//	and bundle them into a single message
			s.conn.Send(conn.NewEntries{
				Entries: []doc.AcceptedEntry{u},
			})
		case doc.WelcomeMessage:
			s.conn.Send(conn.WelcomeMessage{
				SessionID:     s.sessionID,
				MissedEntries: u.MissedEntries,
			})
		case doc.ProposeAck:
			s.conn.Send(u)
		case doc.CloseMessage:
			// Sometimes a close message will be spawned by the document
			s.conn.Send(u)
			s.conn.Close()
			return
		default:
			log.Println("Session received unexpected message type from doc")
		}
	}
}
