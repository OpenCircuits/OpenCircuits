package doc

import (
	"errors"
	"fmt"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

// Changelog contains the model logic for accepting log entries
type Changelog struct {
	LogClock uint64
}

// Accept adds a proposed entry to the log
func (l *Changelog) Accept(e model.ChangelogEntry) (model.ChangelogEntry, error) {
	if e.ProposedClock > l.LogClock {
		reason := fmt.Sprintf("proposal number (%d) too high for log clock (%d)",
			e.ProposedClock,
			l.LogClock,
		)
		return e, errors.New(reason)
	}
	// TODO: This is also where entries that are "too old" are excluded
	// TODO: Check for schema mismatch
	e.AcceptedClock = l.LogClock
	l.LogClock++

	return e, nil
}
