package access

import (
	"fmt"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type (
	cT = map[model.CircuitId]model.CircuitPermissions
	lT = map[model.LinkId]model.CircuitId
)

// Simple in-memory model system for testing
type memDriver struct {
	circuits cT
	links    lT
	linkIdx  int
}

func NewMem() interfaces.AccessDriver {
	return &memDriver{circuits: make(cT), links: make(lT), linkIdx: 0}
}

func (m memDriver) GetCircuit(circuitId model.CircuitId) (*model.CircuitPermissions, error) {
	if c, ok := m.circuits[circuitId]; ok {
		return &c, nil
	}
	return nil, nil
}

func (m memDriver) GetCircuitUser(circuitId model.CircuitId, userId model.UserId) (*model.UserPermission, error) {
	if c, ok := m.circuits[circuitId]; ok {
		if cu, ok := c.UserPerms[userId]; ok {
			return &cu, nil
		}
	}
	return nil, nil
}

func (m memDriver) GetLink(linkId model.LinkId) (*model.LinkPermission, error) {
	if cID, ok := m.links[linkId]; ok {
		if c, ok := m.circuits[cID]; ok {
			if cl, ok := c.LinkPerms[linkId]; ok {
				return &cl, nil
			}
		}
	}
	return nil, nil
}

func (m memDriver) GetUser(userId model.UserId) (model.AllUserPermissions, error) {
	// Yes, this is slow
	perms := make(model.AllUserPermissions)
	for k, v := range m.circuits {
		if p, ok := v.UserPerms[userId]; ok {
			perms[k] = p
		}
	}
	return perms, nil
}

func (m memDriver) UpsertCircuitUser(perm model.UserPermission) error {
	if _, ok := m.circuits[perm.CircuitId]; !ok {
		m.circuits[perm.CircuitId] = model.NewCircuitPerm(perm.CircuitId)
	}
	m.circuits[perm.CircuitId].UserPerms[perm.UserId] = perm
	return nil
}

func (m *memDriver) UpsertCircuitLink(perm model.LinkPermission) (model.LinkPermission, error) {
	if _, ok := m.circuits[perm.CircuitId]; !ok {
		m.circuits[perm.CircuitId] = model.NewCircuitPerm(perm.CircuitId)
	}
	if _, ok := m.circuits[perm.CircuitId].LinkPerms[perm.LinkId]; !ok {
		// Generate a link id
		m.linkIdx += 1
		perm.LinkId = fmt.Sprintf("%d", m.linkIdx)
	}
	m.circuits[perm.CircuitId].LinkPerms[perm.LinkId] = perm
	return perm, nil
}

func (m memDriver) DeleteCircuit(circuitId model.CircuitId) error {
	delete(m.circuits, circuitId)
	return nil
}

func (m memDriver) DeleteCircuitUser(circuitId model.CircuitId, userId model.UserId) error {
	if c, ok := m.circuits[circuitId]; ok {
		delete(c.UserPerms, userId)
	}
	return nil
}

func (m memDriver) DeleteLink(linkId model.LinkId) error {
	if circuitId, ok := m.links[linkId]; ok {
		if c, ok := m.circuits[circuitId]; ok {
			delete(c.LinkPerms, linkId)
		}
	}
	return nil
}
