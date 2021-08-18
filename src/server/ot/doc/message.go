package doc

import (
	"encoding/json"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// MessageWrapper is used to send messages to the Document thread.
//	Resp should be buffered to avoid blocking the Document thread
type MessageWrapper struct {
	Resp MessageChan
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
	LogClock  uint64
	UserID    model.SessionID
	SessionID model.SessionID
}

type LeaveDocument struct {
	SessionID model.SessionID
}

//
// Messages sent to the Session
//

type AcceptedEntry = ChangelogEntry

type ProposeAck struct {
	AcceptedClock uint64
}

type WelcomeMessage struct {
	Session       SessionJoined
	MissedEntries []AcceptedEntry
	Sessions      []SessionJoined
}

type NewEntry = AcceptedEntry

// Close messages are fatal errors
type CloseMessage struct {
	Reason string
}

type SessionJoined struct {
	UserID    model.UserId
	SessionID model.SessionID
}

type SessionLeft = LeaveDocument

//
// Helper functions used by the Document to avoid accidently sending types over
//	the channel that aren't expected
//

func NewMsgChan(ch chan<- interface{}) MessageChan {
	return MessageChan{ch}
}

type MessageChan struct {
	ch chan<- interface{}
}

func (ch MessageChan) Ack(m ProposeAck) {
	ch.ch <- m
}

func (ch MessageChan) Welcome(m WelcomeMessage) {
	ch.ch <- m
}

func (ch MessageChan) Entry(m NewEntry) {
	ch.ch <- m
}

func (ch MessageChan) Joined(m SessionJoined) {
	ch.ch <- m
}

func (ch MessageChan) Left(m SessionLeft) {
	ch.ch <- m
}

func (ch MessageChan) Close(m CloseMessage) {
	ch.ch <- m
}
