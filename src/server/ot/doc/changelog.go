package doc

import (
	"encoding/json"
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type ChangelogEntry struct {
	// Action is raw representation of the action used by clients
	Action json.RawMessage
	// ProposedClock is the clock submitted by the client
	ProposedClock uint64
	// AcceptedClock is the clock in the log
	AcceptedClock uint64
	// SchemaVersion is the version of the client Action schema
	SchemaVersion model.SchemaVersion
	// UserID is the unique ID of the user (injected by the authorization system)
	UserID model.UserId
	// SessionID is the unique ID of a connected client
	SessionID model.SessionID
}

func (p ProposeEntry) Accept(AcceptedClock uint64) ChangelogEntry {
	return ChangelogEntry{
		Action:        p.Action,
		ProposedClock: p.ProposedClock,
		AcceptedClock: AcceptedClock,
		SchemaVersion: p.SchemaVersion,
		UserID:        p.UserID,
		SessionID:     p.SessionID,
	}
}

// Strip removes any information the clients should not receive about the entry
func (e ChangelogEntry) Strip() AcceptedEntry {
	return e
}

// TODO: This will need an offset when trimmed
type Changelog struct {
	entries  []ChangelogEntry
	logClock uint64
}

func (l *Changelog) AddEntry(p ProposeEntry) (AcceptedEntry, error) {
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
