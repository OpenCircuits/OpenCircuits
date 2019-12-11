package storage

import (
	"errors"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
)

type memCircuitStorageInterfaceFactory struct {
	// Since the storage supports the interface this is fine.  For other kinds of storage, this pattern
	//	of returning a single global object may not be suitable.
	memInterface *memCircuitStorage
}

// A simple, array-based circuit storage for testing and example circuits
type memCircuitStorage struct {
	m      []model.Circuit
	idxMap map[string]int
}

func newMemCircuitStorage() *memCircuitStorage {
	return &memCircuitStorage{
		m: nil,
		idxMap: make(map[string]int),
	}
}

func NewMemStorageInterfaceFactory() interfaces.CircuitStorageInterfaceFactory {
	return &memCircuitStorageInterfaceFactory{newMemCircuitStorage()}
}

func (m *memCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() interfaces.CircuitStorageInterface {
	return m.memInterface
}

func (mem *memCircuitStorage) UpdateCircuit(c model.Circuit) {
	val, ok := mem.idxMap[c.Metadata.ID]
	if !ok {
		panic(errors.New("circuit did not exist for given id"))
	}
	mem.m[val] = c
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
	val, ok := mem.idxMap[id]
	if !ok {
		return nil
	}
	return &mem.m[val]
}

func (mem *memCircuitStorage) checkToken(token string) bool {
	_, ok := mem.idxMap[token]
	return !ok
}

func (mem *memCircuitStorage) NewCircuit() model.Circuit {
	var c model.Circuit
	c.Metadata.ID = utils.GenFreshCircuitId(mem.checkToken)
	mem.idxMap[c.Metadata.ID] = len(mem.m)
	mem.m = append(mem.m, c)
	return c
}

func (mem *memCircuitStorage) DeleteCircuit(id model.CircuitId) {
	v, ok := mem.idxMap[id]
	if !ok {
		return
	}
	mem.m[v] = model.Circuit{}
	delete(mem.idxMap, id)
}

func (mem *memCircuitStorage) Close() {}
