package session

import (
	"errors"
	"math"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
)

type mockDocument struct {
	// Join mock
	join        ot.JoinDocument
	joinWelcome ot.WelcomeMessage

	// Leave mock
	leaveID model.SessionID

	// Propose mock
	prop    ot.ProposeEntry
	propAck ot.ProposeAck

	// common error
	err error

	// common panic
	panic interface{}
}

func (md *mockDocument) Join(e ot.JoinDocument) (ot.WelcomeMessage, error) {
	md.join = e
	if md.panic != nil {
		panic(md.panic)
	}
	return md.joinWelcome, md.err
}

func (md *mockDocument) Leave(sessionID model.SessionID) {
	md.leaveID = sessionID
	if md.panic != nil {
		panic(md.panic)
	}
}

func (md *mockDocument) Propose(e ot.ProposeEntry) (ot.ProposeAck, error) {
	md.prop = e
	if md.panic != nil {
		panic(md.panic)
	}
	return md.propAck, md.err
}

type mockAccessProvider model.BasePermission

func (m mockAccessProvider) Permissions() model.BasePermission {
	return model.BasePermission(m)
}

func mockSession(accessLevel model.AccessLevel) (*Session, *conn.MockConn, *mockDocument) {
	c := conn.NewMockConn()
	d := &mockDocument{}
	p := model.BasePermission{
		AccessLevel: accessLevel,
		Expiration:  math.MaxInt64,
	}
	s := NewSession(SessionParam{
		UserID:    "TEST",
		SessionID: model.NewSessionID(),
		Conn:      c,
		Doc:       d,
		Access:    mockAccessProvider(p),
	})
	return s, c, d
}

func TestSessionHandleJoinSuccess(t *testing.T) {
	s, c, d := mockSession(model.AccessCreator)

	d.joinWelcome = ot.WelcomeMessage{
		Session: ot.SessionJoined{
			UserID: "HELLO",
		},
	}
	err := s.handleJoin(10)
	if err != nil {
		t.Error("unexpected error")
	}

	w, ok := <-c.SentData
	if !ok {
		t.Error("expected welcome message sent to connection")
	}
	m, ok := w.(conn.WelcomeMessage)
	if !ok {
		t.Error("expected welcome message sent to connection")
	}
	if m.Session.UserID != "HELLO" {
		t.Error("propagation of welcome message failed")
	}
}

func TestSessionHandleJoinBadPerms(t *testing.T) {
	s, _, _ := mockSession(model.AccessNone)

	err := s.handleJoin(10)
	if err == nil {
		t.Error("expected permission error joining")
	}
}

func TestSessionHandleJoinDocFail(t *testing.T) {
	s, _, d := mockSession(model.AccessCreator)
	d.err = errors.New("failed to join")

	err := s.handleJoin(10)
	if err == nil {
		t.Error("expected permission error joining")
	}
}

func TestSessionHandleProposeSuccess(t *testing.T) {
	s, c, d := mockSession(model.AccessCreator)

	d.propAck.AcceptedClock = 6

	err := s.handlePropose(conn.ProposeEntry{
		ProposedClock: 5,
	})
	if err != nil {
		t.Error("unexpected error: ", err)
	}

	if d.prop.ProposedClock != 5 {
		t.Errorf("expected proposed clock of 5, got %d", d.prop.ProposedClock)
	}
	a, ok := <-c.SentData
	if !ok {
		t.Error("expected ack message sent to connection")
	}
	ack, ok := a.(conn.Updates)
	if !ok {
		t.Error("expected ack message sent to connection")
	}
	if ack.AcceptedClock != 6 {
		t.Error("propagation of ack message failed")
	}
}

func TestSessionHandleProposeBadPerms(t *testing.T) {
	s, _, _ := mockSession(model.AccessView)
	err := s.handlePropose(conn.ProposeEntry{
		ProposedClock: 5,
	})
	if err == nil {
		t.Error("expected permission error")
	}
}

func TestSessionHandleProposeNack(t *testing.T) {
	s, _, d := mockSession(model.AccessCreator)

	d.err = errors.New("Nack")
	err := s.handlePropose(conn.ProposeEntry{})
	if err == nil {
		t.Error("expected nack error: ", err)
	}
}

func TestSessionHandleUpdatesSuccess(t *testing.T) {
	s, c, _ := mockSession(model.AccessCreator)

	s.cache.newEntry = append(s.cache.newEntry, ot.AcceptedEntry{
		AcceptedClock: 5,
	})
	s.cache.hasUpdates = true

	err := s.handleUpdates()
	if err != nil {
		t.Error("unexpected error: ", err)
	}

	a, ok := <-c.SentData
	if !ok {
		t.Error("expected updates message sent to connection")
	}
	up, ok := a.(conn.Updates)
	if !ok {
		t.Error("expected updates message sent to connection")
	}
	if len(up.NewEntries) != 1 {
		t.Fatal("propagation of update message failed")
	}
	if up.NewEntries[0].AcceptedClock != 5 {
		t.Fatal("propagation of update had wrong clock")
	}
}

func TestSessionHandleUpdatesLostPerms(t *testing.T) {
	s, _, _ := mockSession(model.AccessNone)

	s.cache.newEntry = append(s.cache.newEntry, ot.AcceptedEntry{
		AcceptedClock: 5,
	})
	s.cache.hasUpdates = true

	err := s.handleUpdates()
	if err == nil {
		t.Error("expected permissions error")
	}
}
