package session

import (
	"log"
	"reflect"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
)

type SessionParam struct {
	UserID    model.UserId
	SessionID model.SessionID
	Conn      conn.Connection
	Doc       doc.Document
	Access    AccessProvider
}

type sessionState struct {
	SessionParam
	docUpdates chan interface{}
}

type Session struct {
	SessionID model.SessionID
}

func NewSession(p SessionParam, logClock uint64) Session {
	s := sessionState{
		SessionParam: p,
		docUpdates:   make(chan interface{}, 64),
	}

	// Join the document before starting the threads
	s.sendDoc(doc.JoinDocument{
		LogClock:  logClock,
		UserID:    s.UserID,
		SessionID: s.SessionID,
	})

	go s.networkListener()
	go s.networkSender()

	return Session{
		SessionID: s.SessionID,
	}
}

func (s sessionState) sendDoc(v interface{}) {
	s.Doc.Send(doc.MessageWrapper{
		Resp: doc.NewMsgChan(s.docUpdates),
		Data: v,
	})
}

func (s sessionState) close() {
	s.Conn.Close()
	s.sendDoc(doc.LeaveDocument{
		SessionID: s.SessionID,
	})
	close(s.docUpdates)
}

// die sends a close message to the doc listener thread, which indirectly
//	closes the session
func (s sessionState) die(reason string) {
	doc.NewMsgChan(s.docUpdates).Close(doc.CloseMessage{
		Reason: reason,
	})
}

// sendConn wraps the connection's Send function to make sure the user is still
//	alowed to see new updates and closes the session if revoked
func (s sessionState) sendConn(v interface{}) {
	if !s.Access.Permissions().CanView() {
		s.die("insufficient permissions (view)")
		return
	}
	s.Conn.Send(v)
}

// networkListener listens to messages coming from the client.
//	It can be single-threaded because proposals come one-at-a-time
func (s sessionState) networkListener() {
	defer s.close()

	for msg := range s.Conn.Recv() {
		switch msg := msg.(type) {
		case conn.ProposeEntry:
			if !s.Access.Permissions().CanEdit() {
				s.die("insufficient permissions (edit)")
				return
			}

			s.sendDoc(doc.ProposeEntry{
				Action:        msg.Action,
				ProposedClock: msg.ProposedClock,
				SchemaVersion: msg.SchemaVersion,
				UserID:        s.UserID,
				SessionID:     s.SessionID,
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
		// TODO: always send ACK messages immediately with currently cached updates,
		//	otherwise wait until time since last message is high enough
		switch u := u.(type) {
		case doc.NewEntry:
			s.sendConn(conn.Updates{
				NewEntries:     []doc.AcceptedEntry{u},
				SessionsJoined: []doc.SessionJoined{},
				SessionsLeft:   []doc.SessionLeft{},
			})
		case doc.ProposeAck:
			s.sendConn(conn.ProposeAck{
				AcceptedClock: u.AcceptedClock,
				Updates:       conn.Updates{},
			})
		case doc.SessionJoined:
			s.sendConn(conn.Updates{
				NewEntries:     []doc.AcceptedEntry{},
				SessionsJoined: []doc.SessionJoined{u},
				SessionsLeft:   []doc.LeaveDocument{},
			})
		case doc.SessionLeft:
			s.sendConn(conn.Updates{
				NewEntries:     []doc.AcceptedEntry{},
				SessionsJoined: []doc.SessionJoined{},
				SessionsLeft:   []doc.LeaveDocument{u},
			})
		case doc.WelcomeMessage:
			s.sendConn(u)
		case doc.CloseMessage:
			s.Conn.Send(u)
			s.Conn.Close()
			return
		default:
			log.Println(
				"Session received unexpected message type from doc: ",
				reflect.TypeOf(u).Name())
		}
	}
}
