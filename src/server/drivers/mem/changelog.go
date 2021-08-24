package mem

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

// NewChangelogFactory creates a new ChangelogDriverFactory for use in testing
func NewChangelogFactory() model.ChangelogDriverFactory {
	return &memChangelog{}
}

// NewChangelogDriver creates a new ChangelogDriver for use in testing
func NewChangelogDriver() model.ChangelogDriver {
	return &memChangelog{}
}

type memChangelog struct {
	l          []model.ChangelogEntry
	startClock uint64
}

func (l *memChangelog) NewChangelogDriver(circuitID model.CircuitID) model.ChangelogDriver {
	return l
}

func (l *memChangelog) AppendChangelog(es model.ChangelogEntry) {
	l.l = append(l.l, es)
}

func (l *memChangelog) ChangelogRange(start, end uint64) []model.ChangelogEntry {
	s := int64(start) - int64(l.startClock)
	e := int64(end) - int64(l.startClock)

	if e < 0 {
		e = 0
	} else if e > int64(len(l.l)) {
		e = int64(len(l.l))
	}

	if s < 0 {
		s = 0
	} else if s > int64(len(l.l)) {
		s = int64(len(l.l))
	}

	return l.l[s:e]
}

func (l *memChangelog) ChangelogClock() uint64 {
	if len(l.l) == 0 {
		return 0
	}
	return l.l[len(l.l)-1].AcceptedClock + 1
}

func (l *memChangelog) TrimChangelog(end uint64) {
	l.l = l.l[:end]
	l.startClock = end
}
