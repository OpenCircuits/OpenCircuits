package session

import (
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/ot"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
)

// UpdatesCache is a SessionHandle instance that uses a set of mutex-locked
//	slices to accumulate updates, and a rising-edge channel to communicate
//	update availability to the session
type UpdatesCache struct {
	updateMut     sync.Mutex
	hasUpdates    bool
	newEntry      []ot.NewEntry
	sessionJoined []ot.SessionJoined
	sessionLeft   []ot.SessionLeft

	OnUpdate func()
}

// PartialHandle creates a partial SessionHandle instance that handles updates
func (s *UpdatesCache) PartialHandle() ot.SessionHandle {
	return ot.SessionHandle{
		NewEntry: func(e ot.NewEntry) {
			s.updateMut.Lock()
			defer s.updateMut.Unlock()
			s.newEntry = append(s.newEntry, e)
			s.updateUpdateState()
		},
		SessionJoined: func(e ot.SessionJoined) {
			s.updateMut.Lock()
			defer s.updateMut.Unlock()
			s.sessionJoined = append(s.sessionJoined, e)
			s.updateUpdateState()
		},
		SessionLeft: func(e ot.SessionLeft) {
			s.updateMut.Lock()
			defer s.updateMut.Unlock()
			s.sessionLeft = append(s.sessionLeft, e)
			s.updateUpdateState()
		},
	}
}

func (s *UpdatesCache) updateUpdateState() {
	// Send message on rising edge
	if !s.hasUpdates {
		s.OnUpdate()
	}
	s.hasUpdates = true
}

// Pop removes all updates from the cache and returns them / if any
func (s *UpdatesCache) Pop() (conn.Updates, bool) {
	s.updateMut.Lock()
	defer s.updateMut.Unlock()
	if !s.hasUpdates {
		return conn.Updates{}, false
	}
	s.hasUpdates = false
	updates := conn.Updates{
		NewEntries:     s.newEntry,
		SessionsJoined: s.sessionJoined,
		SessionsLeft:   s.sessionLeft,
	}
	s.newEntry = nil
	s.sessionJoined = nil
	s.sessionLeft = nil
	return updates, true
}

// Ack notifies the cache that its updates message has been received
//	and will cause subsequent updates to call OnUpdate again
func (s *UpdatesCache) Ack() {
	s.updateMut.Lock()
	defer s.updateMut.Unlock()
	s.hasUpdates = false
}
