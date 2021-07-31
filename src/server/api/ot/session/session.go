package session

import (
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/api/ot/doc"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gorilla/websocket"
)

type SessionID struct {
	ID string
}

type Session struct {
	SessionID  SessionID
	CircuitID  model.CircuitId
	conn       *websocket.Conn
	done       chan<- SessionID
	docUpdates chan interface{}
	doc        chan<- doc.MessageWrapper
	// TODO Add cached permissions, which can be updated
	// perms   chan UserPermissions
}

func (s *Session) start() {
	go s.networkListener()
	go s.documentListener()
}

func (s *Session) close() {
	s.conn.Close()
	s.doc <- doc.MessageWrapper{
		Resp: s.docUpdates,
		Data: doc.LeaveDocument{},
	}
	close(s.docUpdates)
	s.done <- s.SessionID
}

// networkListener is the main loop of the session
func (s *Session) networkListener() {
	// Setup document listener to close when the network does
	defer s.close()

	// This can be synchronous because only one client is using this
	for {
		mt, message, err := s.conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}

		//
		// TODO: Handle the message
		//
		response := message

		err = s.conn.WriteMessage(mt, response)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func (s *Session) documentListener() {
	// This must be asynchronous so the document doesn't stall waiting
	//	on channels to be cleared out
	for u := range s.docUpdates {
		go s.conn.WriteJSON(u)
	}
}
