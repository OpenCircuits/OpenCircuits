package doc

import "github.com/OpenCircuits/OpenCircuits/site/go/core/model"

type LogEntry struct {
	// Action is raw representation of the action used by clients
	Action []byte
	// ProposedClock is the clock submitted by the client
	ProposedClock uint64
	// AcceptedClock is the clock in the log
	AcceptedClock uint64
	// SchemaVersion is the version of the client Action schema
	SchemaVersion uint32
	// SessionID is the unique ID for the session
	SessionID string
	// UserID is the unique ID of the user (injected by the authorization system)
	UserID model.UserId
}

type Log struct {
	Entries  []LogEntry
	LogClock uint64
}

func (l *Log) AddEntry(e LogEntry) uint64 {
	e.AcceptedClock = l.LogClock
	l.LogClock++
	l.Entries = append(l.Entries, e)
	return e.AcceptedClock
}

func (l Log) Range(begin uint64, end int64) []LogEntry {
	if end < 0 {
		end = len(l.Entries)
	}
	return l.Entries[begin:end]
}
