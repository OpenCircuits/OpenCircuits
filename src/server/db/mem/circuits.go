package mem

import (
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type circuit struct {
	ID      model.CircuitID          `json:"id"`
	Circuit model.Circuit            `json:"circuit"`
	Perms   model.CircuitPermissions `json:"perms"`
}

// A simple, array-based circuit storage for testing
type memCircuitStorage struct {
	Circuits []circuit `json:"circuits"`
	Counter  int       `json:"counter"`
	mut      sync.Mutex
	file     persistence
}

func (mem *memCircuitStorage) save() {
	mem.file.save(mem)
}

func (mem *memCircuitStorage) load() {
	mem.file.load(mem)
}

func NewCircuitDB(persistFile string) model.CircuitDBFactory {
	mem := &memCircuitStorage{
		mut:  sync.Mutex{},
		file: persistence{persistFile},
	}
	mem.load()
	return mem
}

func NewVolatileCircuitDB() model.CircuitDBFactory {
	return NewCircuitDB("")
}

func (mem *memCircuitStorage) Create() model.CircuitDB {
	return mem
}

func (mem *memCircuitStorage) loadEntry(id model.CircuitID) (*circuit, int) {
	for i, c := range mem.Circuits {
		if c.ID == id {
			return &mem.Circuits[i], i
		}
	}
	return nil, -1
}

func (mem *memCircuitStorage) EnumerateUser(user model.UserID) []model.CircuitListing {
	mem.mut.Lock()
	defer mem.mut.Unlock()

	var ret []model.CircuitListing
	for _, c := range mem.Circuits {
		if c.Perms.Owner == user {
			ret = append(ret, model.CircuitListing{
				ID:        c.ID,
				Name:      c.Circuit.Metadata.Name,
				Desc:      c.Circuit.Metadata.Desc,
				Version:   c.Circuit.Metadata.Version,
				Thumbnail: c.Circuit.Metadata.Thumbnail,
			})
		}
	}
	return ret
}

func (mem *memCircuitStorage) LoadCircuit(id model.CircuitID) (model.Circuit, bool) {
	mem.mut.Lock()
	defer mem.mut.Unlock()

	entry, _ := mem.loadEntry(id)
	if entry == nil {
		return model.Circuit{}, false
	} else {
		return entry.Circuit, true
	}
}

func (mem *memCircuitStorage) InsertCircuit(c model.Circuit, perms model.CircuitPermissions) model.CircuitID {
	mem.mut.Lock()
	defer mem.mut.Unlock()
	defer mem.save()

	mem.Circuits = append(mem.Circuits, circuit{})

	entry := &mem.Circuits[len(mem.Circuits)-1]
	entry.Circuit = c
	entry.Perms = perms

	mem.Counter += 1
	entry.ID = model.CircuitID(mem.Counter)

	return entry.ID
}

func (mem *memCircuitStorage) UpdateCircuit(id model.CircuitID, c model.Circuit) {
	mem.mut.Lock()
	defer mem.mut.Unlock()
	defer mem.save()

	entry, _ := mem.loadEntry(id)
	if entry == nil {
		panic("Attempt to update ID that does not exist")
	}
	entry.Circuit = c
}

func (mem *memCircuitStorage) DeleteCircuit(id model.CircuitID) {
	mem.mut.Lock()
	defer mem.mut.Unlock()
	defer mem.save()

	_, i := mem.loadEntry(id)
	if i < 0 {
		return
	}

	l := len(mem.Circuits) - 1
	mem.Circuits[i] = mem.Circuits[l]
	mem.Circuits = mem.Circuits[:l]
}

func (mem *memCircuitStorage) LoadPermissions(id model.CircuitID) (model.CircuitPermissions, bool) {
	mem.mut.Lock()
	defer mem.mut.Unlock()

	entry, _ := mem.loadEntry(id)
	if entry == nil {
		return model.CircuitPermissions{}, false
	} else {
		return entry.Perms, true
	}
}

func (mem *memCircuitStorage) UpdatePermissions(id model.CircuitID, perms model.CircuitPermissions) {
	mem.mut.Lock()
	defer mem.mut.Unlock()
	defer mem.save()

	entry, _ := mem.loadEntry(id)
	if entry != nil {
		entry.Perms = perms
	}
}
