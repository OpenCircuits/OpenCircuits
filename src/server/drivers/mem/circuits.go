package mem

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type memCircuitStorageInterfaceFactory struct {
	// Since the storage supports the interface this is fine.  For other kinds of storage, this pattern
	//	of returning a single global object may not be suitable.
	memInterface *memCircuitStorage
}

// A simple, array-based circuit storage for testing and example circuits
type memCircuitStorage struct {
	Circuits map[model.CircuitID]model.Circuit `json:"circuits"`
	mut      sync.Mutex
}

func newMemCircuitStorage() *memCircuitStorage {
	mem := &memCircuitStorage{
		Circuits: make(map[model.CircuitID]model.Circuit),
		mut:      sync.Mutex{},
	}
	mem.load()
	return mem
}

func NewInterfaceFactory() model.CircuitStorageInterfaceFactory {
	return &memCircuitStorageInterfaceFactory{newMemCircuitStorage()}
}

func (m *memCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() model.CircuitStorageInterface {
	return m.memInterface
}

const MEM_FILE_PATH string = "/tmp/OpenCircuits_Circuits.json"

func (mem *memCircuitStorage) load() {
	data, err := ioutil.ReadFile(MEM_FILE_PATH)
	if err != nil {
		fmt.Printf("Failed to load \"mem\" circuit data from %s: %e\n", MEM_FILE_PATH, err)
		return
	}
	if err := json.Unmarshal(data, &mem); err != nil {
		panic(err)
	}
}

// save assumes the mutex is already held
func (mem *memCircuitStorage) save() {
	data, err := json.Marshal(&mem)
	if err != nil {
		panic(err)
	}
	if err := ioutil.WriteFile(MEM_FILE_PATH, data, 0644); err != nil {
		panic(err)
	}
}

func (mem *memCircuitStorage) UpsertCircuit(c model.Circuit) {
	mem.mut.Lock()
	defer mem.mut.Unlock()
	mem.Circuits[c.Metadata.ID] = c
	mem.save()
}

func (mem *memCircuitStorage) EnumerateCircuits(userID model.UserID) []model.CircuitMetadata {
	mem.mut.Lock()
	defer mem.mut.Unlock()

	var ret []model.CircuitMetadata
	for _, v := range mem.Circuits {
		if v.Metadata.Owner == userID {
			ret = append(ret, v.Metadata)
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
	defer mem.mut.Unlock()

	delete(mem.Circuits, id)
	mem.save()
}

func (mem *memCircuitStorage) Close() {}
