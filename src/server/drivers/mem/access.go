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

func (m memAccess) GetCircuit(circuitID model.CircuitID) (model.CircuitPermissions, error) {
	if c, ok := m.circuits[circuitID]; ok {
		return c, nil
	}
	return model.CircuitPermissions{}, nil
}

func (m memAccess) GetCircuitUser(circuitID model.CircuitID, userID model.UserID) (model.UserPermission, error) {
	if c, ok := m.circuits[circuitID]; ok {
		if cu, ok := c.UserPerms[userID]; ok {
			return cu, nil
		}
	}
	return model.UserPermission{}, nil
}

func (m memAccess) GetLink(linkID model.LinkID) (model.LinkPermission, error) {
	if cID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[cID]; ok {
			if cl, ok := c.LinkPerms[linkID]; ok {
				return cl, nil
			}
		}
	}
	return model.LinkPermission{}, nil
}

func (m memAccess) GetUser(userID model.UserID) (model.AllUserPermissions, error) {
	// Yes, this is slow
	perms := make(model.AllUserPermissions)
	for k, v := range m.circuits {
		if p, ok := v.UserPerms[userID]; ok {
			perms[k] = p
		}
	}
	return perms, nil
}

func (m memAccess) UpsertCircuitUser(perm model.UserPermission) error {
	if _, ok := m.circuits[perm.CircuitID]; !ok {
		m.circuits[perm.CircuitID] = model.NewCircuitPerm(perm.CircuitID)
	}
	m.circuits[perm.CircuitID].UserPerms[perm.UserID] = perm
	return nil
}

func (m *memAccess) UpsertCircuitLink(perm model.LinkPermission) (model.LinkPermission, error) {
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

func (m memAccess) DeleteCircuit(circuitID model.CircuitID) error {
	delete(m.circuits, circuitID)
	return nil
}

func (m memAccess) DeleteCircuitUser(circuitID model.CircuitID, userID model.UserID) error {
	if c, ok := m.circuits[circuitID]; ok {
		delete(c.UserPerms, userID)
	}
	return nil
}

func (m memAccess) DeleteLink(linkID model.LinkID) error {
	if circuitID, ok := m.links[linkID]; ok {
		if c, ok := m.circuits[circuitID]; ok {
			delete(c.LinkPerms, linkID)
		}
	}
	return nil
}
