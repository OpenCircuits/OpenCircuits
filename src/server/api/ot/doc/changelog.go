package doc

import "github.com/OpenCircuits/OpenCircuits/site/go/core/model"

type ChangelogEntry struct {
	// Action is raw representation of the action used by clients
	Action []byte
	// ProposedClock is the clock submitted by the client
	ProposedClock uint64
	// AcceptedClock is the clock in the log
	AcceptedClock uint64
	// SchemaVersion is the version of the client Action schema
	SchemaVersion uint32
	// SessionID is the unique ID for the session; MAYBE NOT REQUIRED HERE
	SessionID string
	// UserID is the unique ID of the user (injected by the authorization system)
	UserID model.UserId
}

// Sent by messaging layer of proposer
type ProposedEntry struct {
	Action        []byte
	ProposedClock uint64
	SchemaVersion uint32
	SessionID     string
	UserID        string
}

// Sent to connected clients who weren't the proposer
type AcceptedEntry struct {
	Action        []byte
	ProposedClock uint64
	AcceptedClock uint64
	SchemaVersion uint32
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
	Entries  []ChangelogEntry
	LogClock uint64
}

func (l *Changelog) AddEntry(p ProposedEntry) AcceptedEntry {
	e := p.Accept(l.LogClock)
	l.LogClock++
	l.Entries = append(l.Entries, e)
	return e.Strip()
}

func (l *Changelog) Slice(begin uint64) []AcceptedEntry {
	return l.Range(begin, uint64(len(l.Entries)))
}

func (l *Changelog) Range(begin uint64, end uint64) []AcceptedEntry {
	res := make([]AcceptedEntry, end-begin)
	for i, v := range l.Entries[begin:end] {
		res[i] = v.Strip()
	}
	return res
}
