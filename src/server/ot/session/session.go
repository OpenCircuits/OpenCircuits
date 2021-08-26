package session

import (
	"errors"
	"fmt"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
)

type SessionParam struct {
	UserID    model.UserID
	SessionID model.SessionID
	Conn      conn.Connection
	Doc       ot.Document
	Access    model.AccessProvider
}

// NewSession creates a new session instance.  Session will not start before running Run
func NewSession(p SessionParam) *Session {
	updatesChan := make(chan bool, 1)
	return &Session{
		SessionParam: p,

		cache: UpdatesCache{
			OnUpdate: func() {
				updatesChan <- true
			},
		},
		updatesChan: updatesChan,

		// 2 sources of close signal:
		//	- Document
		//	- Network listener thread
		closeChan:   make(chan bool, 2),
		proposeChan: make(chan conn.ProposeEntry),
	}
}

// Session is a connection state between a single client and a single document
//	- Enforces user permissions
//	- Rate-limits updates to/from the client
type Session struct {
	SessionParam

	cache UpdatesCache

	updatesChan <-chan bool
	closeChan   chan bool
	proposeChan chan conn.ProposeEntry
}

// Run starts the network listener goroutine and runs the session's main loop
//	It waits for messages from the client and updates from the document
//	It contains the logic for tearing down the listener and itself upon:
//		- session panics
//		- document panics (closing)
//		- connection failure / closure
func (s *Session) Run(logClock uint64) {
	defer func() {
		if r := recover(); r != nil {
			s.sendClose(fmt.Sprintf("session panic'd: %v", r))
		}
		// Close connection if listener goroutine is blocked on Recv (1)
		s.Conn.Close()

		// Read propose channel if listener goroutine is blocked on send (2)
		_, _ = <-s.proposeChan
	}()
	defer s.Doc.Leave(s.SessionID)

	// Send the join message before starting the loops
	err := s.handleJoin(logClock)
	if err != nil {
		s.sendClose(err.Error())
		return
	}

	// Start the listener
	go conn.Listener{
		Conn: s.Conn,
		OnPropose: func(e conn.ProposeEntry) {
			s.proposeChan <- e // This can block (2)
		},
		OnClose: func(err error) {
			s.sendClose(err.Error())
			s.closeChan <- true
		},
	}.Listen()

	// Start the main loop
	for {
		var err error
		select {
		case p := <-s.proposeChan:
			// Received proposal from WS
			err = s.handlePropose(p)

		case <-s.updatesChan:
			// Received update from document
			err = s.handleUpdates()

		case <-s.closeChan:
			return
		}

		if err != nil {
			s.sendClose(err.Error())
			return
		}
	}
}

func (s *Session) handleJoin(logClock uint64) error {
	if !s.Access.Permissions().CanEdit() {
		return errors.New("insufficient permissions (view)")
	}

	// Create the callback used to process updates
	handle := s.cache.PartialCallback()
	handle.Info = ot.SessionInfo{SessionJoined: ot.SessionJoined{
		UserID:    s.UserID,
		SessionID: s.SessionID,
	}}
	handle.Close = func() {
		s.closeChan <- true
	}

	welcome, err := s.Doc.Join(ot.JoinDocument{
		LogClock: logClock,
		Session:  handle,
	})
	if err != nil {
		return errors.New("failed to join document")
	}
	return s.sendMsg(welcome)
}

func (s *Session) handlePropose(p conn.ProposeEntry) error {
	if !s.Access.Permissions().CanEdit() {
		return errors.New("insufficient permissions (edit)")
	}

	ack, err := s.Doc.Propose(ot.ProposeEntry{
		Action:        p.Action,
		ProposedClock: p.ProposedClock,
		SchemaVersion: p.SchemaVersion,
		UserID:        s.UserID,
	})
	// TODO: Explicit Nack?
	if err != nil {
		return err
	}

	updates, _ := s.cache.Pop()
	updates.AcceptedClock = ack.AcceptedClock
	return s.sendMsg(updates)
}

func (s *Session) handleUpdates() error {
	// TODO: rate-limit this path with s.cache.Ack()
	updates, _ := s.cache.Pop()
	return s.sendMsg(updates)
}

func (s *Session) sendMsg(v interface{}) error {
	if !s.Access.Permissions().CanView() {
		return errors.New("insufficient permissions (view)")
	}
	return s.Conn.Send(v)
}

func (s *Session) sendClose(msg string) {
	_ = s.Conn.Send(conn.CloseMessage{
		Reason: msg,
	})
}
