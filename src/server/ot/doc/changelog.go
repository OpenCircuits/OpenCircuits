package doc

import (
	"encoding/json"
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// Set action type to json raw message to avoid deserializing the
//	actual action and avoid complex parsing logic.  This is just
//	a byte array anyway
type Action json.RawMessage

type ChangelogEntry struct {
	// Action is raw representation of the action used by clients
	Action Action
	// ProposedClock is the clock submitted by the client
	ProposedClock uint64
	// AcceptedClock is the clock in the log
	AcceptedClock uint64
	// SchemaVersion is the version of the client Action schema
	SchemaVersion string
	// SessionID is the unique ID for the session; MAYBE NOT REQUIRED HERE
	SessionID string
	// UserID is the unique ID of the user (injected by the authorization system)
	UserID model.UserId
}

// Sent by messaging layer of proposer
type ProposedEntry struct {
	Action        Action
	ProposedClock uint64
	SchemaVersion string
	SessionID     string `json:"-"`
	UserID        string
}

// Sent to connected clients who weren't the proposer
type AcceptedEntry struct {
	Action        Action
	ProposedClock uint64
	AcceptedClock uint64
	SchemaVersion string
	UserID        string
}

func (p ProposedEntry) Accept(AcceptedClock uint64) ChangelogEntry {
	return ChangelogEntry{
		Action:        p.Action,
		ProposedClock: p.ProposedClock,
		AcceptedClock: AcceptedClock,
		SchemaVersion: p.SchemaVersion,
		SessionID:     p.SessionID,
		UserID:        p.UserID,
	}
}

func (e ChangelogEntry) Strip() AcceptedEntry {
	// Session ID is secret
	return AcceptedEntry{
		Action:        e.Action,
		ProposedClock: e.ProposedClock,
		AcceptedClock: e.AcceptedClock,
		SchemaVersion: e.SchemaVersion,
		UserID:        e.UserID,
	}
}

// TODO: This will need an offset when trimmed
type Changelog struct {
	entries  []ChangelogEntry
	logClock uint64
}

func (l *Changelog) AddEntry(p ProposedEntry) (AcceptedEntry, error) {
	if p.ProposedClock > l.logClock {
		return AcceptedEntry{}, errors.New("proposed clock too high")
	}
	// TODO: This is also where entries that are "too old" are excluded
	// TODO: Check for schema mismatch
	e := p.Accept(l.logClock)
	l.logClock++
	l.entries = append(l.entries, e)
	return e.Strip(), nil
}

func (l *Changelog) Slice(begin uint64) []AcceptedEntry {
	return l.Range(begin, uint64(len(l.entries)))
}

func (l *Changelog) Range(begin uint64, end uint64) []AcceptedEntry {
	res := make([]AcceptedEntry, end-begin)
	for i, v := range l.entries[begin:end] {
		res[i] = v.Strip()
	}
	return res
}

func (l *Changelog) LogClock() uint64 {
	return l.logClock
}
