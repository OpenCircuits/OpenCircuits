package ot

import (
	"encoding/json"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type AcceptedEntry = model.ChangelogEntry

type NewEntry = AcceptedEntry

type SessionJoined struct {
	UserID    model.UserID
	SessionID model.SessionID
}

type SessionLeft struct {
	SessionID model.SessionID
}

type SessionInfo struct {
	SessionJoined
}

// SessionHandle is the interface between the document and session
//	NOTE: All call-backs will be called from the same goroutine
type SessionHandle struct {
	// NewEntry is called when an entry from another session is accepted
	NewEntry func(NewEntry)
	// SessionJoined is called when another session joins the document
	SessionJoined func(SessionJoined)
	// SessionLeft is called when another session leaves the document
	SessionLeft func(SessionLeft)
	// Close is called when the document is closing (for some reason)
	//	This is a perminant state change
	Close func()

	// Info is the static SessionInfo
	Info SessionInfo
}

type ProposeEntry struct {
	Action        json.RawMessage
	ProposedClock uint64
	SchemaVersion model.SchemaVersion
	UserID        model.UserID
	SessionID     model.SessionID
}

type ProposeAck struct {
	AcceptedClock uint64
}

type JoinDocument struct {
	LogClock uint64
	Session  SessionHandle
}

type WelcomeMessage struct {
	Session       SessionJoined
	MissedEntries []AcceptedEntry
	Sessions      []SessionJoined
}

type Document interface {
	Propose(ProposeEntry) (ProposeAck, error)
	Join(JoinDocument) (WelcomeMessage, error)
	Leave(sessionID model.SessionID)
}
