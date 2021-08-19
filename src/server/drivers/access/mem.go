package access

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type (
	cT = map[model.CircuitID]model.CircuitPermissions
	lT = map[model.LinkID]model.CircuitID
)

// Simple in-memory model system for testing
type memDriver struct {
	circuits cT
	links    lT
}

func NewMem() interfaces.AccessDriver {
	return &memDriver{circuits: make(cT), links: make(lT)}
}

func (m memDriver) GetCircuit(circuitID model.CircuitID) (model.CircuitPermissions, error) {
	if c, ok := m.circuits[circuitID]; ok {
		return c, nil
	}
	return model.CircuitPermissions{}, nil
}

func (m memDriver) GetCircuitUser(circuitID model.CircuitID, userID model.UserID) (model.UserPermission, error) {
	if c, ok := m.circuits[circuitID]; ok {
		if cu, ok := c.UserPerms[userID]; ok {
			return cu, nil
		}
	}
	return model.UserPermission{}, nil
}

func (m memDriver) GetLink(linkID model.LinkID) (model.LinkPermission, error) {
	if cID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[cID]; ok {
			if cl, ok := c.LinkPerms[linkID]; ok {
				return cl, nil
			}
		}
	}
	return model.LinkPermission{}, nil
}

func (m memDriver) GetUser(userID model.UserID) (model.AllUserPermissions, error) {
	// Yes, this is slow
	perms := make(model.AllUserPermissions)
	for k, v := range m.circuits {
		if p, ok := v.UserPerms[userID]; ok {
			perms[k] = p
		}
	}
	return perms, nil
}

func (m memDriver) UpsertCircuitUser(perm model.UserPermission) error {
	if _, ok := m.circuits[perm.CircuitID]; !ok {
		m.circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	m.circuits[perm.CircuitID].UserPerms[perm.UserID] = perm
	return nil
}

func (m *memDriver) UpsertCircuitLink(perm model.LinkPermission) (model.LinkPermission, error) {
	if _, ok := m.circuits[perm.CircuitID]; !ok {
		m.circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	if _, ok := m.circuits[perm.CircuitID].LinkPerms[perm.LinkID]; !ok {
		// Generate a link id
		perm.LinkID = model.NewLinkID()
	}
	m.circuits[perm.CircuitID].LinkPerms[perm.LinkID] = perm
	return perm, nil
}

func (m memDriver) DeleteCircuit(circuitID model.CircuitID) error {
	delete(m.circuits, circuitID)
	return nil
}

func (m memDriver) DeleteCircuitUser(circuitID model.CircuitID, userID model.UserID) error {
	if c, ok := m.circuits[circuitID]; ok {
		delete(c.UserPerms, userID)
	}
	return nil
}

func (m memDriver) DeleteLink(linkID model.LinkID) error {
	if circuitID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[circuitID]; ok {
			delete(c.LinkPerms, linkID)
		}
	}
	return nil
}
