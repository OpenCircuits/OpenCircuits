package mem

import (
	"fmt"

	"github.com/OpenCircuits/OpenCircuits/site/go/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type cT = map[model.CircuitId]access.CircuitPermissions
type lT = map[access.LinkId]model.CircuitId

// Simple in-memory access system for testing
type memDriver struct {
	circuits cT
	links    lT
	linkIdx  int
}

func New() access.DataDriver {
	return &memDriver{circuits: make(cT), links: make(lT), linkIdx: 0}
}

func (m memDriver) GetCircuit(circuitId model.CircuitId) (*access.CircuitPermissions, error) {
	if c, ok := m.circuits[circuitId]; ok {
		return &c, nil
	}
	return nil, nil
}

func (m memDriver) GetCircuitUser(circuitId model.CircuitId, userId model.UserId) (*access.UserPermission, error) {
	if c, ok := m.circuits[circuitId]; ok {
		if cu, ok := c.UserPerms[userId]; ok {
			return &cu, nil
		}
	}
	return nil, nil
}

func (m memDriver) GetLink(linkId access.LinkId) (*access.LinkPermission, error) {
	if cID, ok := m.links[linkId]; ok {
		if c, ok := m.circuits[cID]; ok {
			if cl, ok := c.LinkPerms[linkId]; ok {
				return &cl, nil
			}
		}
	}
	return nil, nil
}

func (m memDriver) UpsertCircuitUser(perm access.UserPermission) error {
	if _, ok := m.circuits[perm.CircuitId]; !ok {
		m.circuits[perm.CircuitId] = access.NewCircuitPerm(perm.CircuitId)
	}
	m.circuits[perm.CircuitId].UserPerms[perm.UserId] = perm
	return nil
}

func (m *memDriver) UpsertCircuitLink(perm access.LinkPermission) (access.LinkPermission, error) {
	if _, ok := m.circuits[perm.CircuitId]; !ok {
		m.circuits[perm.CircuitId] = access.NewCircuitPerm(perm.CircuitId)
	}
	if _, ok := m.circuits[perm.CircuitId].LinkPerms[perm.LinkId]; !ok {
		// Generate a link id
		m.linkIdx += 1
		perm.LinkId = fmt.Sprintf("%d", m.linkIdx)
	}
	m.circuits[perm.CircuitId].LinkPerms[perm.LinkId] = perm
	return perm, nil
}

func (m memDriver) DeleteCircuitUser(circuitId model.CircuitId, userId model.UserId) error {
	if c, ok := m.circuits[circuitId]; ok {
		delete(c.UserPerms, userId)
	}
	return nil
}

func (m memDriver) DeleteLink(linkId access.LinkId) error {
	if circuitId, ok := m.links[linkId]; ok {
		if c, ok := m.circuits[circuitId]; ok {
			delete(c.LinkPerms, linkId)
		}
	}
	return nil
}
