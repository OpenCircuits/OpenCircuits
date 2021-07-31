package doc

import (
	"log"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// Document contains the core OT logic
type Document struct {
	CircuitID model.CircuitId
	liveTime  time.Duration
	log       Log
	recv      chan MessageWrapper
	done      chan<- model.CircuitId
	clients   map[chan<- interface{}]bool
}

func (d *Document) cleanup() {}

func (d Document) timeout() <-chan time.Time {
	return time.After(d.liveTime)
}

func (d *Document) messageLoop() {
	defer d.cleanup()
	defer func() { d.done <- d.CircuitID }()

	// Timeout so that documents can close after a specified inactivity period
	to := d.timeout()
	renew := false

	for {
		select {
		case mw := <-d.recv:
			if m, ok := mw.Data.(JoinDocument); ok {
				d.clients[mw.Resp] = true
				mw.Resp <- d.log.Range(m.LogClock, -1)
			} else if _, ok := mw.Data.(LeaveDocument); ok {
				delete(d.clients, mw.Resp)

				if len(d.clients) == 0 {
					log.Printf("Last client left, closing %s...\n", d.CircuitID)
					return
				}
			} else {
				if _, ok := d.clients[mw.Resp]; !ok {
					log.Println("Message sent from un-joined client")
					continue
				}
				if m, ok := mw.Data.(ProposeAction); ok {
					mw.Resp <- d.serverRecv(m)
				}
			}
			renew = true
		case <-to:
			if !renew {
				return
			}
			to = d.timeout()
		}
	}
}

func (d *Document) serverRecv(msg ProposeAction) interface{} {
	return nil
}
