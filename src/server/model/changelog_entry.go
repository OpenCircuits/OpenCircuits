package model

import (
	"encoding/json"
)

// ChangelogDriver abstracts the storage of changelog entries
//	so databases can be used, or in-memory storage, or some caching scheme.
type ChangelogDriver interface {
	// AppendChangelogEntry adds an entry to the end of the log
	AppendChangelog(es ChangelogEntry)
	// ChangelogRange fetches all entries in [start,end)
	ChangelogRange(start, end uint64) []ChangelogEntry
	// ChangelogClock gets the clock of the latest entry
	ChangelogClock() uint64
	// TODO deletes [0, end)
	TrimChangelog(end uint64)
}

// ChangelogDriverFactory constructs ChangelogDrivers for circuit IDs
type ChangelogDriverFactory interface {
	NewChangelogDriver(circuitID CircuitID) (ChangelogDriver, error)
}

// ChangelogEntry contains all information used directly in the OT algorithm
//	and auxillary information for the clients participating in the algorithm
type ChangelogEntry struct {
	// Action is raw representation of the action used by clients
	Action json.RawMessage
	// ProposedClock is the clock submitted by the client
	ProposedClock uint64
	// AcceptedClock is the clock in the log
	AcceptedClock uint64
	// SchemaVersion is the version of the client Action schema
	SchemaVersion SchemaVersion
	// UserID is the unique ID of the user (injected by the authorization system)
	UserID UserID
	// SessionID is the unique ID of a connected client
	SessionID SessionID
}

// Strip removes any information the clients should not receive about the entry
func (e ChangelogEntry) Strip() {}
