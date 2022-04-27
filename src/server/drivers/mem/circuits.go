package mem

import (
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

// A simple, array-based circuit storage for testing and example circuits
type memCircuitStorage struct {
	Circuits map[model.CircuitID]model.Circuit `json:"circuits"`
	mut      sync.Mutex
	file     persistence
}

func (mem *memCircuitStorage) save() {
	mem.file.save(mem)
}

func (mem *memCircuitStorage) load() {
	mem.file.load(mem)
}

func NewCircuitDriver() model.CircuitDriver {
	mem := &memCircuitStorage{
		Circuits: make(map[model.CircuitID]model.Circuit),
		mut:      sync.Mutex{},
		file:     persistence{"/tmp/OpenCircuits_Circuits.json"},
	}
	mem.load()
	return mem
}

func (mem *memCircuitStorage) UpsertCircuit(c model.Circuit) {
	mem.mut.Lock()
	defer mem.save()
	defer mem.mut.Unlock()

	mem.Circuits[c.Metadata.ID] = c
}

func (mem *memCircuitStorage) LoadMetadata(ids []model.CircuitID) []model.CircuitMetadata {
	mem.mut.Lock()
	defer mem.mut.Unlock()

	var ret []model.CircuitMetadata
	for _, v := range ids {
		if circuit, ok := mem.Circuits[v]; ok {
			ret = append(ret, circuit.Metadata)
		}
	}
	return ret
}

func (mem *memCircuitStorage) LoadCircuit(id model.CircuitID) *model.Circuit {
	mem.mut.Lock()
	defer mem.mut.Unlock()

	if copy, ok := mem.Circuits[id]; ok {
		return &copy
	}
	return nil
}

func (mem *memCircuitStorage) DeleteCircuit(id model.CircuitID) {
	mem.mut.Lock()
	defer mem.save()
	defer mem.mut.Unlock()

	delete(mem.Circuits, id)
}

func (mem *memCircuitStorage) Close() {}
