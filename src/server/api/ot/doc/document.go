package doc

import (
	"log"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// Document is the interface between sessions and the document state
type Document struct {
	CircuitID model.CircuitId
	send      chan<- MessageWrapper
}

func (d Document) Send(mw MessageWrapper) {
	d.send <- mw
}

func NewDocument(circuitID model.CircuitId, done chan<- model.CircuitId) Document {
	ch := make(chan MessageWrapper)
	d := docState{
		CircuitID: circuitID,
		liveTime:  5 * time.Minute,

		log:     &Changelog{}, // TODO: This needs to be loaded
		clients: make(map[string]chan<- interface{}),

		recv: ch,
		done: done,
	}
	go d.messageLoop()

	return Document{
		CircuitID: circuitID,
		send:      ch,
	}
}

type docState struct {
	CircuitID model.CircuitId
	liveTime  time.Duration

	log     *Changelog
	clients map[string]chan<- interface{}

	recv <-chan MessageWrapper
	done chan<- model.CircuitId
}

func (d docState) close() {
	d.done <- d.CircuitID
}

func (d docState) messageLoop() {
	defer d.close()

	// TODO: _may_ want some sort of time-out if sessions can live forever
	for {
		mw := <-d.recv
		if m, ok := mw.Data.(JoinDocument); ok {
			d.clients[mw.SessionID] = mw.Resp
			mw.Resp <- WelcomeMessage{
				MissedEntries: d.log.Slice(m.LogClock),
			}
		} else if _, ok := mw.Data.(LeaveDocument); ok {
			delete(d.clients, mw.SessionID)

			if len(d.clients) == 0 {
				log.Printf("Last client left, closing %s...\n", d.CircuitID)
				return
			}
		} else if m, ok := mw.Data.(Propose); ok {
			if _, ok := d.clients[mw.SessionID]; !ok {
				log.Println("Message sent from un-joined client")
				continue
			}

			mw.Resp <- d.serverRecv(m)
		}
	}
}

func (d docState) serverRecv(msg Propose) interface{} {
	// In a concurrent request, acceptedClock != proposedClock
	accepted, err := d.log.AddEntry(msg)
	if err != nil {
		return ProposeNack{d.log.LogClock(), err.Error()}
	}

	// Send to other clients
	for sid, ch := range d.clients {
		if sid == msg.SessionID {
			continue
		}
		ch <- accepted
	}

	// Acknowledge the request
	return ProposeAck{AcceptedClock: accepted.AcceptedClock}
}
