package doc

import (
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type DocumentParam struct {
	CircuitID model.CircuitID
	Drivers   DocumentDrivers
	OnClose   DocumentClose
}

// DocumentDrivers are the drivers used by the document for saving state
type DocumentDrivers struct {
	model.ChangelogDriver
	model.MilestoneDriver
	model.CircuitDriver
}

// DocumentClose is the callback for when the document closes
type DocumentClose func()

type documentState struct {
	DocumentParam

	sessions  map[MessageChan]SessionJoined
	recv      <-chan MessageWrapper
	changelog *Changelog
}

// Document is the interface between sessions and the document state
type Document struct {
	CircuitID model.CircuitID
	send      chan<- MessageWrapper
}

// NewDocument launches a new document instance
func NewDocument(p DocumentParam) Document {
	d, st := newDocument(p)
	go st.messageLoop()
	return d
}

func newDocument(p DocumentParam) (Document, documentState) {
	ch := make(chan MessageWrapper)
	st := documentState{
		DocumentParam: p,

		sessions:  map[MessageChan]SessionJoined{},
		recv:      ch,
		changelog: &Changelog{},
	}
	doc := Document{
		CircuitID: p.CircuitID,
		send:      ch,
	}
	return doc, st
}

// Send sends a message (see messages.go) to the document
func (d Document) Send(mw MessageWrapper) {
	d.send <- mw
}

func (d documentState) messageLoop() {
	defer d.OnClose()
	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered in Document message loop: ", r)
			for ch := range d.sessions {
				ch.Close(CloseMessage{"internal document error"})
			}
		}
	}()

	// bootstrap the log clock
	d.changelog.LogClock = d.Drivers.ChangelogClock()

	// TODO: _may_ want some sort of time-out if sessions can live forever
	for {
		mw := <-d.recv
		switch m := mw.Data.(type) {
		case ProposeEntry:
			if _, ok := d.sessions[mw.Resp]; !ok {
				mw.Resp.Close(CloseMessage{
					Reason: "proposal from unjoined session",
				})
				continue
			}
			d.proposeEntry(m, mw.Resp)
		case JoinDocument:
			if _, ok := d.sessions[mw.Resp]; ok {
				mw.Resp.Close(CloseMessage{
					Reason: "join from joined session",
				})
				continue
			}
			d.joinDocument(m, mw.Resp)
		case LeaveDocument:
			// Double-leave
			if _, ok := d.sessions[mw.Resp]; !ok {
				log.Printf("session %s already left\n", m.SessionID)
				continue
			}
			if d.leaveDocument(m, mw.Resp) {
				return
			}
		}
	}
}

func (d documentState) proposeEntry(msg ProposeEntry, resp MessageChan) {
	accepted := model.ChangelogEntry{
		Action:        msg.Action,
		ProposedClock: msg.ProposedClock,
		SchemaVersion: msg.SchemaVersion,
		UserID:        msg.UserID,
		SessionID:     msg.SessionID,
	}

	// In a concurrent request, acceptedClock != proposedClock
	accepted, err := d.changelog.Accept(accepted)
	if err != nil {
		resp.Close(CloseMessage{err.Error()})
		return
	}

	// Save to persistent storage _before_ telling other sessions
	d.Drivers.AppendChangelog(accepted)

	// Send to other clients
	accepted.Strip()
	for ch := range d.sessions {
		if ch == resp {
			continue
		}
		ch.Entry(accepted)
	}

	// Acknowledge the request
	resp.Ack(ProposeAck{AcceptedClock: accepted.AcceptedClock})
}

func (d documentState) joinDocument(m JoinDocument, resp MessageChan) {
	// Collect existing sessions
	existingSessions := make([]SessionJoined, 0, len(d.sessions))
	for _, s := range d.sessions {
		existingSessions = append(existingSessions, s)
	}

	// Create the new one
	newSession := SessionJoined{
		UserID:    m.UserID,
		SessionID: m.SessionID,
	}
	d.sessions[resp] = newSession

	// Give the new session all the information it needs
	resp.Welcome(WelcomeMessage{
		Session:       newSession,
		MissedEntries: d.Drivers.ChangelogRange(m.LogClock, d.changelog.LogClock),
		Sessions:      existingSessions,
	})

	// Tell all other sessions another one joined
	for ch := range d.sessions {
		if ch == resp {
			continue
		}
		ch.Joined(SessionJoined{
			UserID:    m.UserID,
			SessionID: m.SessionID,
		})
	}
}

func (d documentState) leaveDocument(m LeaveDocument, resp MessageChan) bool {
	// Remove this session from out list
	delete(d.sessions, resp)

	// Tell all other sessions one left
	for ch := range d.sessions {
		ch.Left(m)
	}

	// The last session to leave closes the document
	if len(d.sessions) == 0 {
		log.Printf("Last client left, closing %s...\n", d.CircuitID)
		return true
	}
	return false
}
