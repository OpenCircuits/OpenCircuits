package mem

import "github.com/OpenCircuits/OpenCircuits/site/go/model"

type (
	cT = map[model.CircuitID]model.CircuitPermissions
	lT = map[model.LinkID]model.CircuitID
)

// Simple in-memory model system for testing
type memAccess struct {
	circuits cT
	links    lT
}

// NewAccess creates a new AccessDriver for use in testing
func NewAccess() model.AccessDriver {
	return &memAccess{circuits: make(cT), links: make(lT)}
}

func (m memAccess) GetCircuit(circuitID model.CircuitID) (model.CircuitPermissions, bool) {
	if c, ok := m.circuits[circuitID]; ok {
		return c, ok
	}
	return model.CircuitPermissions{}, false
}

func (m memAccess) GetCircuitUser(circuitID model.CircuitID, userID model.UserID) (model.UserPermission, bool) {
	if c, ok := m.circuits[circuitID]; ok {
		if cu, ok := c.UserPerms[userID]; ok {
			return cu, ok
		}
	}
	return model.UserPermission{}, false
}

func (m memAccess) GetLink(linkID model.LinkID) (model.LinkPermission, bool) {
	if cID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[cID]; ok {
			if cl, ok := c.LinkPerms[linkID]; ok {
				return cl, ok
			}
		}
	}
	return model.LinkPermission{}, false
}

func (m memAccess) GetUser(userID model.UserID) model.AllUserPermissions {
	// Yes, this is slow
	perms := make(model.AllUserPermissions)
	for k, v := range m.circuits {
		if p, ok := v.UserPerms[userID]; ok {
			perms[k] = p
		}
	}
	return perms
}

func (m memAccess) UpsertCircuitUser(perm model.UserPermission) {
	if _, ok := m.circuits[perm.CircuitID]; !ok {
		m.circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	m.circuits[perm.CircuitID].UserPerms[perm.UserID] = perm
}

func (m *memAccess) UpsertCircuitLink(perm model.LinkPermission) model.LinkPermission {
	if _, ok := m.circuits[perm.CircuitID]; !ok {
		m.circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	if _, ok := m.circuits[perm.CircuitID].LinkPerms[perm.LinkID]; !ok {
		// Generate a link id
		perm.LinkID = model.NewLinkID()
	}
	m.circuits[perm.CircuitID].LinkPerms[perm.LinkID] = perm
	return perm
}

func (m memAccess) DeleteCircuit(circuitID model.CircuitID) {
	delete(m.circuits, circuitID)
}

func (m memAccess) DeleteCircuitUser(circuitID model.CircuitID, userID model.UserID) {
	if c, ok := m.circuits[circuitID]; ok {
		delete(c.UserPerms, userID)
	}
}

func (m memAccess) DeleteLink(linkID model.LinkID) {
	if circuitID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[circuitID]; ok {
			delete(c.LinkPerms, linkID)
		}
	}
}
