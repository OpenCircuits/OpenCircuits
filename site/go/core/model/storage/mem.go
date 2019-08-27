package storage

import (
	"errors"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type MemCircuitStorageInterfaceFactory struct {
	memInterface *memCircuitStorage
}

// A simple, array-based circuit storage for testing and example circuits
type memCircuitStorage struct {
	m      []model.Circuit
	nextId model.CircuitId
}

func (mem *memCircuitStorage) inStore(id model.CircuitId) bool {
	return id < int64(len(mem.m))
}

func (m *MemCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() interfaces.CircuitStorageInterface {
	// Since the storage supports the interface this is fine.  For other kinds of storage, this pattern
	//	of returning a single global object may not be suitable.
	if m.memInterface == nil {
		m.memInterface = &memCircuitStorage{}
	}
	return m.memInterface
}

func (mem *memCircuitStorage) UpdateCircuit(c model.Circuit) {
	if !mem.inStore(c.Metadata.ID) {
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
	if !mem.inStore(id) {
		return nil
	}
	return &mem.m[id]
}

func (mem *memCircuitStorage) NewCircuit() model.Circuit {
	var c model.Circuit
	c.Metadata.ID = mem.nextId
	mem.m = append(mem.m, c)
	mem.nextId++
	return c
}

func (mem *memCircuitStorage) Close() {}
