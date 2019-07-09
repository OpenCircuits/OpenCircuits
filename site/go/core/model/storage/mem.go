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
	// This is fine since maps are reference types
	// TODO: this should support concurrency if used for more than single-request testing
	m         map[model.CircuitId]model.Circuit
	currentId model.CircuitId
}

func (m *MemCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() interfaces.CircuitStorageInterface {
	// Since the storage supports the interface this is fine.  For other kinds of storage, this pattern
	//	of returning a single global object is not suitable.  Each call to this function should return a distinct
	//	instance (i.e. a distinct connection to a database)
	if m.memInterface == nil {
		m.memInterface = &memCircuitStorage{m: make(map[model.CircuitId]model.Circuit)}
	}
	return m.memInterface
}

func (mem *memCircuitStorage) UpdateCircuit(c model.Circuit) {
	_, ok := mem.m[c.Metadata.Id]
	if !ok {
		panic(errors.New("circuit did not exist for given id"))
	}
	mem.m[c.Metadata.Id] = c
}

func (mem *memCircuitStorage) EnumerateCircuits(userId model.UserId) []model.CircuitMetadata {
	var ret []model.CircuitMetadata
	for _,v := range mem.m {
		// TODO: users can only view their own circuits for now
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
	c.Metadata.Id = mem.currentId
	mem.m[c.Metadata.Id] = c
	return c
}

func (mem *memCircuitStorage) Close() {}
