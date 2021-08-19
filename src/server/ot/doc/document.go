package doc

import (
	"fmt"
	"log"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// Document is the interface between sessions and the document state
type Document struct {
	CircuitID model.CircuitID
	send      chan<- MessageWrapper
}

func (d Document) Send(mw MessageWrapper) {
	d.send <- mw
}

func NewDocument(circuitID model.CircuitID, done chan<- model.CircuitID) Document {
	d, ds := newDocument(circuitID, done)
	go ds.messageLoop()
	return d
}

// newDocument is used internally and testing to create a document without starting it
func newDocument(circuitID model.CircuitID, done chan<- model.CircuitID) (Document, docState) {
	ch := make(chan MessageWrapper)
	d := docState{
		CircuitID: circuitID,
		liveTime:  5 * time.Minute,

		log:      &Changelog{}, // TODO: This needs to be loaded
		sessions: make(map[MessageChan]SessionJoined),

		recv: ch,
		done: done,
	}

	return Document{
		CircuitID: circuitID,
		send:      ch,
	}, d
}

type docState struct {
	CircuitID model.CircuitID
	liveTime  time.Duration

	log      *Changelog
	sessions map[MessageChan]SessionJoined

	recv <-chan MessageWrapper
	done chan<- model.CircuitID
}

func (d docState) close() {
	d.done <- d.CircuitID
}

func (d docState) messageLoop() {
	defer d.close()
	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered in Document message loop: ", r)
			for ch := range d.sessions {
				ch.Close(CloseMessage{"internal document error"})
			}
		}
	}()

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

func (d docState) proposeEntry(msg ProposeEntry, resp MessageChan) {
	// In a concurrent request, acceptedClock != proposedClock
	accepted, err := d.log.AddEntry(msg)
	if err != nil {
		resp.Close(CloseMessage{
			Reason: fmt.Sprintf(
				"proposal number (%d) too high for log clock (%d)",
				msg.ProposedClock,
				d.log.LogClock(),
			),
		})
		return
	}

	// Send to other clients
	for ch := range d.sessions {
		if ch == resp {
			continue
		}
		ch.Entry(accepted)
	}

	// Acknowledge the request
	resp.Ack(ProposeAck{AcceptedClock: accepted.AcceptedClock})
}

func (d docState) joinDocument(m JoinDocument, resp MessageChan) {
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
		MissedEntries: d.log.Slice(m.LogClock),
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

func (d docState) leaveDocument(m LeaveDocument, resp MessageChan) bool {
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
