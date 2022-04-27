package mem

import (
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type (
	cT = map[model.CircuitID]model.CircuitPermissions
	lT = map[model.LinkID]model.CircuitID
)

// Simple in-memory model system for testing
type memAccess struct {
	Circuits cT
	Links    lT
	mut      sync.Mutex
	file     persistence
}

// NewAccessDriver creates a new AccessDriver for use in testing
func NewAccessDriver() model.AccessDriver {
	return &memAccess{
		Circuits: make(cT),
		Links:    make(lT),
		mut:      sync.Mutex{},
		file:     persistence{"/tmp/OpenCircuits_Access.json"},
	}
}

func (m *memAccess) save() {
	m.file.save(m)
}
func (m *memAccess) load() {
	m.file.load(m)
}

func (m *memAccess) CircuitPermissions(circuitID model.CircuitID) model.CircuitPermissions {
	m.mut.Lock()
	defer m.mut.Unlock()
	if c, ok := m.Circuits[circuitID]; ok {
		return c
	}
	return model.NewCircuitPerm(circuitID)
}

func (m *memAccess) UserPermission(circuitID model.CircuitID, userID model.UserID) model.UserPermission {
	m.mut.Lock()
	defer m.mut.Unlock()
	if c, ok := m.Circuits[circuitID]; ok {
		return c.UserPerms[userID]
	}
	return model.NewNoAccessPermission(circuitID, userID)
}

func (m *memAccess) LinkPermission(linkID model.LinkID) (model.LinkPermission, bool) {
	m.mut.Lock()
	defer m.mut.Unlock()
	if cID, ok := m.Links[linkID]; ok {
		if c, ok := m.Circuits[cID]; ok {
			if cl, ok := c.LinkPerms[linkID]; ok {
				return cl, true
			}
		}
	}
	return model.LinkPermission{}, false
}

func (m *memAccess) UserPermissions(userID model.UserID) model.AllUserPermissions {
	m.mut.Lock()
	defer m.mut.Unlock()
	// Yes, this is slow
	perms := make(model.AllUserPermissions)
	for k, v := range m.Circuits {
		if p, ok := v.UserPerms[userID]; ok {
			perms[k] = p
		}
	}
	return perms
}

func (m *memAccess) UpsertUserPermission(perm model.UserPermission) {
	m.mut.Lock()
	defer m.save()
	defer m.mut.Unlock()
	if _, ok := m.Circuits[perm.CircuitID]; !ok {
		m.Circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	m.Circuits[perm.CircuitID].UserPerms[perm.UserID] = perm
}

func (m *memAccess) UpsertLinkPermission(perm model.LinkPermission) {
	m.mut.Lock()
	defer m.save()
	defer m.mut.Unlock()
	if _, ok := m.Circuits[perm.CircuitID]; !ok {
		m.Circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	m.Circuits[perm.CircuitID].LinkPerms[perm.LinkID] = perm
}

func (m *memAccess) DeleteCircuitPermissions(circuitID model.CircuitID) {
	m.mut.Lock()
	defer m.save()
	defer m.mut.Unlock()
	delete(m.Circuits, circuitID)
}

func (m *memAccess) DeleteUserPermission(circuitID model.CircuitID, userID model.UserID) {
	m.mut.Lock()
	defer m.save()
	defer m.mut.Unlock()
	if c, ok := m.Circuits[circuitID]; ok {
		delete(c.UserPerms, userID)
	}
}

func (m *memAccess) DeleteLinkPermission(linkID model.LinkID) {
	m.mut.Lock()
	defer m.save()
	defer m.mut.Unlock()
	if circuitID, ok := m.Links[linkID]; ok {
		if c, ok := m.Circuits[circuitID]; ok {
			delete(c.LinkPerms, linkID)
		}
	}
}
