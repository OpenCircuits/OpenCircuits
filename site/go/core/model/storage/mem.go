package storage

import (
	"errors"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type MemCircuitStorageInterfaceFactory struct {
	memInterface *memCircuitStorage
}

type memCircuitStorage struct {
	// TODO: this should support concurrency if used for more than single-request mutable testing
	m         map[model.CircuitId]model.Circuit
	currentId model.CircuitId
}

func (m *MemCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() interfaces.CircuitStorageInterface {
	// Since the storage supports the interface this is fine.  For other kinds of storage, this pattern
	//	of returning a single global object may not be suitable.
	if m.memInterface == nil {
		m.memInterface = &memCircuitStorage{m: make(map[model.CircuitId]model.Circuit)}
	}
	return m.memInterface
}

func (mem *memCircuitStorage) UpdateCircuit(c model.Circuit) {
	_, ok := mem.m[c.Metadata.ID]
	if !ok {
		panic(errors.New("circuit did not exist for given id"))
	}
	mem.m[c.Metadata.ID] = c
}

func (mem *memCircuitStorage) EnumerateCircuits(userId model.UserId) []model.CircuitMetadata {
	var ret []model.CircuitMetadata
	for _, v := range mem.m {
		if v.Metadata.Owner == userId {
			ret = append(ret, v.Metadata)
		}
	}
	return ret
}

func (mem *memCircuitStorage) LoadCircuit(id model.CircuitId) *model.Circuit {
	v, ok := mem.m[id]
	if !ok {
		return nil
	}
	return &v
}

func (mem *memCircuitStorage) NewCircuit() model.Circuit {
	var c model.Circuit
	mem.currentId++
	c.Metadata.ID = mem.currentId
	mem.m[c.Metadata.ID] = c
	return c
}

func (mem *memCircuitStorage) Close() {}
