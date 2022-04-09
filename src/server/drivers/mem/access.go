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

func (m memAccess) CircuitPermissions(circuitID model.CircuitID) model.CircuitPermissions {
	if c, ok := m.circuits[circuitID]; ok {
		return c
	}
	return model.NewCircuitPerm(circuitID)
}

func (m memAccess) UserPermission(circuitID model.CircuitID, userID model.UserID) model.UserPermission {
	if c, ok := m.circuits[circuitID]; ok {
		return c.UserPerms[userID]
	}
	return model.NewNoAccessPermission(circuitID, userID)
}

func (m memAccess) LinkPermission(linkID model.LinkID) model.LinkPermission {
	if cID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[cID]; ok {
			if cl, ok := c.LinkPerms[linkID]; ok {
				return cl
			}
		}
	}
	return model.NewInvalidLink(linkID)
}

func (m memAccess) UserPermissions(userID model.UserID) model.AllUserPermissions {
	// Yes, this is slow
	perms := make(model.AllUserPermissions)
	for k, v := range m.circuits {
		if p, ok := v.UserPerms[userID]; ok {
			perms[k] = p
		}
	}
	return perms
}

func (m memAccess) UpsertUserPermission(perm model.UserPermission) {
	if _, ok := m.circuits[perm.CircuitID]; !ok {
		m.circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	m.circuits[perm.CircuitID].UserPerms[perm.UserID] = perm
}

func (m memAccess) UpsertLinkPermission(perm model.LinkPermission) model.LinkPermission {
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

func (m memAccess) DeleteCircuitPermissions(circuitID model.CircuitID) {
	delete(m.circuits, circuitID)
}

func (m memAccess) DeleteUserPermission(circuitID model.CircuitID, userID model.UserID) {
	if c, ok := m.circuits[circuitID]; ok {
		delete(c.UserPerms, userID)
	}
}

func (m memAccess) DeleteLinkPermission(linkID model.LinkID) {
	if circuitID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[circuitID]; ok {
			delete(c.LinkPerms, linkID)
		}
	}
}
