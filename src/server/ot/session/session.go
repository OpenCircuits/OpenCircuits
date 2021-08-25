package session

import (
	"log"
	"reflect"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
)

type SessionParam struct {
	UserID    model.UserID
	SessionID model.SessionID
	Conn      conn.Connection
	Doc       doc.Document
	Access    model.AccessProvider
}

type Session struct {
	SessionID model.SessionID
}

func NewSession(p SessionParam, logClock uint64) Session {
	// TODO: The 64 here is so the document does not stall if one
	//	session has a minor hold-up sending updates to the client
	docUpdates := make(chan interface{}, 64)

	sender := networkSender{
		SessionParam: p,
		DocUpdates:   docUpdates,
	}
	listener := networkListener{
		SessionParam: p,
	}

	// Join the document before starting the threads
	listener.sendDoc(doc.JoinDocument{
		LogClock: logClock,
		UserID:   p.UserID,
		Updates:  doc.NewMsgChan(docUpdates),
	})

	go listener.run()
	go sender.run()

	return Session{
		SessionID: p.SessionID,
	}
}

// networkListener listens to messages coming from the client.
//	It can be single-threaded because proposals come one-at-a-time
type networkListener struct {
	SessionParam
}

func (s networkListener) sendDoc(v interface{}) {
	s.Doc.Send(doc.MessageWrapper{
		Sender: s.SessionID,
		Data:   v,
	})
}

func (s networkListener) close() {
	_ = s.Conn.Close()
	s.sendDoc(doc.LeaveDocument{})
}

func (s networkListener) run() {
	defer s.close()
	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered in Session listener loop: ", r)
			s.Conn.Send(conn.CloseMessage{"internal session error"})
		}
	}()

	for {
		msg, err := s.Conn.Recv()
		if err != nil {
			log.Println("Connection failed: ", err)
			return
		}

		switch msg := msg.(type) {
		case conn.ProposeEntry:
			if !s.Access.Permissions().CanEdit() {
				s.Conn.Send(conn.CloseMessage{
					Reason: "insufficient permissions (view)",
				})
				return
			}

			s.sendDoc(doc.ProposeEntry{
				Action:        msg.Action,
				ProposedClock: msg.ProposedClock,
				SchemaVersion: msg.SchemaVersion,
				UserID:        s.UserID,
			})
		default:
			log.Println(
				"Session received unexpected message type from client: ",
				reflect.TypeOf(msg).Name())
			return
		}
	}
}

// networkSender guarantees messages are sent to the client in the correct
//	order by sending from a single thread.
type networkSender struct {
	SessionParam

	DocUpdates <-chan interface{}
}

func (s networkSender) run() {
	// Only defer closing the connection, because that will cause "networkListener" to close
	//	if it hasn't already, which will call the sessionState close function
	defer s.Conn.Close()
	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered in Session sender loop: ", r)
			s.Conn.Send(conn.CloseMessage{"internal session error"})
		}
	}()

	for u := range s.DocUpdates {
		switch u := u.(type) {
		case doc.CloseMessage:
			s.Conn.Send(u)
			return
		}

		if !s.Access.Permissions().CanView() {
			s.Conn.Send(conn.CloseMessage{
				Reason: "insufficient permissions (view)",
			})
			return
		}

		// TODO: always send ACK messages immediately with currently cached updates,
		//	otherwise wait until time since last message is high enough
		switch u := u.(type) {
		case doc.NewEntry:
			s.Conn.Send(conn.Updates{
				NewEntries:     []doc.AcceptedEntry{u},
				SessionsJoined: []doc.SessionJoined{},
				SessionsLeft:   []doc.SessionLeft{},
			})
		case doc.ProposeAck:
			s.Conn.Send(conn.ProposeAck{
				AcceptedClock: u.AcceptedClock,
				Updates:       conn.Updates{},
			})
		case doc.SessionJoined:
			s.Conn.Send(conn.Updates{
				NewEntries:     []doc.AcceptedEntry{},
				SessionsJoined: []doc.SessionJoined{u},
				SessionsLeft:   []doc.SessionLeft{},
			})
		case doc.SessionLeft:
			s.Conn.Send(conn.Updates{
				NewEntries:     []doc.AcceptedEntry{},
				SessionsJoined: []doc.SessionJoined{},
				SessionsLeft:   []doc.SessionLeft{u},
			})
		case doc.WelcomeMessage:
			s.Conn.Send(u)
		default:
			log.Println(
				"Session received unexpected message type from doc: ",
				reflect.TypeOf(u).Name())
		}
	}
}
