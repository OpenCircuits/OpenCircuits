package doc

import (
	"encoding/json"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// MessageWrapper is used to send messages to the Document thread.
//	Resp should be buffered to avoid blocking the Document thread
type MessageWrapper struct {
	Resp chan<- interface{}
	Data interface{}
}

//
// Messages sent to the Document
//

type ProposeEntry struct {
	Action        json.RawMessage
	ProposedClock uint64
	SchemaVersion model.SchemaVersion
	UserID        model.UserId
	SessionID     model.SessionID
}

type JoinDocument struct {
	LogClock uint64
}

type LeaveDocument struct{}

//
// Messages sent to the Session
//

type AcceptedEntry = ChangelogEntry

type ProposeAck struct {
	AcceptedClock uint64
}

type WelcomeMessage struct {
	MissedEntries []AcceptedEntry
}

type NewEntry = AcceptedEntry

// Close messages are fatal errors
type CloseMessage struct {
	Reason string
}

//
// Helper functions used by the Document to avoid accidently sending types over
//	the channel that aren't expected
//

func SafeSendAck(ch chan<- interface{}, m ProposeAck) {
	ch <- m
}

func SafeSendWelcome(ch chan<- interface{}, m WelcomeMessage) {
	ch <- m
}

func SafeSendNewEntry(ch chan<- interface{}, m NewEntry) {
	ch <- m
}

func SafeSendClose(ch chan<- interface{}, m CloseMessage) {
	ch <- m
}
