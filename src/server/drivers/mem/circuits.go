package mem

import (
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type memCircuitStorageInterfaceFactory struct {
	// Since the storage supports the interface this is fine.  For other kinds of storage, this pattern
	//	of returning a single global object may not be suitable.
	memInterface *memCircuitStorage
}

// A simple, array-based circuit storage for testing and example circuits
type memCircuitStorage struct {
	m      []model.Circuit
	idxMap map[model.CircuitID]int
}

func newMemCircuitStorage() *memCircuitStorage {
	return &memCircuitStorage{
		m:      nil,
		idxMap: make(map[model.CircuitID]int),
	}
}

func NewInterfaceFactory() model.CircuitStorageInterfaceFactory {
	return &memCircuitStorageInterfaceFactory{newMemCircuitStorage()}
}

func (m *memCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() model.CircuitStorageInterface {
	return m.memInterface
}

func (mem *memCircuitStorage) UpdateCircuit(c model.Circuit) {
	val, ok := mem.idxMap[c.Metadata.ID]
	if !ok {
		panic(errors.New("circuit did not exist for given id"))
	}
	mem.m[val] = c
}

func (mem *memCircuitStorage) EnumerateCircuits(userID model.UserID) []model.OldCircuitMetadata {
	var ret []model.OldCircuitMetadata
	for _, v := range mem.m {
		if v.Metadata.Owner == userID {
			ret = append(ret, v.Metadata)
		}
	}
	return ret
}

func (mem *memCircuitStorage) LoadCircuit(id model.CircuitID) *model.Circuit {
	val, ok := mem.idxMap[id]
	if !ok {
		return nil
	}
	return &mem.m[val]
}

func (mem *memCircuitStorage) NewCircuit() model.Circuit {
	var c model.Circuit
	c.Metadata.ID = model.NewCircuitID()
	mem.idxMap[c.Metadata.ID] = len(mem.m)
	mem.m = append(mem.m, c)
	return c
}

func (mem *memCircuitStorage) DeleteCircuit(id model.CircuitID) {
	v, ok := mem.idxMap[id]
	if !ok {
		return
	}
	mem.m[v] = model.Circuit{}
	delete(mem.idxMap, id)
}

func (mem *memCircuitStorage) Close() {}
