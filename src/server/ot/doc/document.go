package doc

import (
	"errors"
	"fmt"
	"log"
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type DocumentParam struct {
	CircuitID model.CircuitID
	Drivers   DocumentDrivers
	OnClose   func()
}

// DocumentDrivers are the drivers used by the document for saving state
type DocumentDrivers struct {
	model.ChangelogDriver
	model.MilestoneDriver
	model.CircuitDriver
}

// Document is a live document held by an arbitrary number of sessions.
//	It uses a reference-counting mechanism to keep liveness via the
//	Join and Leave functions.
type Document struct {
	DocumentParam

	sessions  map[model.SessionID]SessionHandle
	changelog Changelog
	mut       sync.Mutex
	panic     interface{}
}

// NewDocument creates and boot-straps a new document instance
func NewDocument(p DocumentParam) *Document {
	return &Document{
		DocumentParam: p,

		sessions: map[model.SessionID]SessionHandle{},
		changelog: Changelog{
			LogClock: p.Drivers.ChangelogClock(),
		},
	}
}

// die sends close messages to all sessions and calls OnClose
func (d *Document) die() {
	// Remove it from the document manager so no more sessions join
	d.OnClose()

	// Close all connected clients
	for sid, s := range d.sessions {
		s.Close()
		delete(d.sessions, sid)
	}
}

// check makes sure than a panic'd document is never used again
func (d *Document) check() {
	if d.panic != nil {
		panic(d.panic)
	}
}

// recover makes sure a panic'd document notifies all connected sessions
func (d *Document) recover() {
	if r := recover(); r != nil {
		d.panic = fmt.Sprintf("document panic'd: %v", r)
		d.die()
		panic(d.panic)
	}
}

// ProposeNackError indicates the proposed entry was invalid
type ProposeNackError struct {
	Inner error
}

func (e ProposeNackError) Error() string {
	return fmt.Sprint("proposed entry invalid: ", e.Inner.Error())
}

// Propose submits a propose entry to the document
func (d *Document) Propose(e ProposeEntry) (ProposeAck, error) {
	d.mut.Lock()
	defer d.mut.Unlock()
	d.check()
	defer d.recover()

	accepted := model.ChangelogEntry{
		Action:        e.Action,
		ProposedClock: e.ProposedClock,
		SchemaVersion: e.SchemaVersion,
		UserID:        e.UserID,
		SessionID:     e.SessionID,
	}

	// In a concurrent request, acceptedClock != proposedClock
	accepted, err := d.changelog.Accept(accepted)
	if err != nil {
		return ProposeAck{}, ProposeNackError{Inner: err}
	}

	// Save to persistent storage _before_ telling other sessions
	d.Drivers.AppendChangelog(accepted)

	// Send to other clients
	accepted.Strip()
	for sid, s := range d.sessions {
		if sid == e.SessionID {
			continue
		}
		s.NewEntry(accepted)
	}

	// Acknowledge the request
	return ProposeAck{AcceptedClock: accepted.AcceptedClock}, nil
}

// Join adds a session to receive updates and notifies all other sessions
func (d *Document) Join(m JoinDocument) (WelcomeMessage, error) {
	d.mut.Lock()
	defer d.mut.Unlock()
	d.check()
	defer d.recover()

	info := m.Session.Info
	if _, ok := d.sessions[info.SessionID]; ok {
		return WelcomeMessage{}, errors.New("join from joined session")
	}

	// Collect existing sessions
	existingSessions := make([]SessionJoined, 0, len(d.sessions))
	for _, s := range d.sessions {
		existingSessions = append(existingSessions, s.Info.SessionJoined)
	}

	// Create the new session
	d.sessions[info.SessionID] = m.Session

	// Tell all other sessions another one joined
	for sid, s := range d.sessions {
		if sid == info.SessionID {
			continue
		}
		s.SessionJoined(info.SessionJoined)
	}

	// Give the new session all the information it needs
	return WelcomeMessage{
		Session:       info.SessionJoined,
		MissedEntries: d.Drivers.ChangelogRange(m.LogClock, d.changelog.LogClock),
		Sessions:      existingSessions,
	}, nil
}

// Leave removes a session from receiving updates and notifies all other sessions
//	Leave is idempotent
func (d *Document) Leave(sessionID model.SessionID) {
	d.mut.Lock()
	defer d.mut.Unlock()
	d.check()
	defer d.recover()

	// Already left, but leave is idempotent
	if _, ok := d.sessions[sessionID]; !ok {
		return
	}

	// Remove this session from out list
	delete(d.sessions, sessionID)

	// Tell all other sessions one left
	for _, s := range d.sessions {
		s.SessionLeft(SessionLeft{
			SessionID: sessionID,
		})
	}

	// The last session to leave closes the document
	if len(d.sessions) == 0 {
		log.Printf("Last client left, closing %s...\n", d.CircuitID)
		d.OnClose()
	}
}
