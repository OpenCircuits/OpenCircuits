package mem

import (
	"math"
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type memCircuitDriver struct {
	md map[model.CircuitID]model.CircuitMetadata
	m  sync.Mutex
	v  model.SchemaVersion
}

// NewCircuitDriver creates a thread-safe in-memory circuit driver for testing
func NewCircuitDriver(version model.SchemaVersion) model.CircuitDriver {
	return &memCircuitDriver{
		md: make(map[model.CircuitID]model.CircuitMetadata),
		m:  sync.Mutex{},
		v:  version,
	}
}

func (m *memCircuitDriver) LookupCircuits(circuitIDs []model.CircuitID) []model.CircuitMetadata {
	m.m.Lock()
	defer m.m.Unlock()

	var res []model.CircuitMetadata
	for _, ci := range circuitIDs {
		if md, ok := m.md[ci]; ok {
			res = append(res, md)
		}
	}
	return res
}

func (m *memCircuitDriver) UpdateMetadata(circuitID model.CircuitID, metadata model.ExplicitMetadata) {
	m.m.Lock()
	defer m.m.Unlock()

	md, ok := m.md[circuitID]
	if !ok {
		panic("memCircuitDriver didn't have circuit ID")
	}
	md.ExplicitMetadata = metadata
}

func (m *memCircuitDriver) NewCircuit(circuitID model.CircuitID, creator model.UserID) {
	m.m.Lock()
	defer m.m.Unlock()

	if _, ok := m.md[circuitID]; ok {
		panic("memCircuitDriver created circuit that already exists")
	}
	emd := model.ExplicitMetadata{
		Name:      new(string),
		Desc:      new(string),
		Thumbnail: new(string),
		TrashUTC:  new(int64),
	}
	*emd.Name = "Untitled Circuit"
	*emd.TrashUTC = math.MaxInt64
	m.md[circuitID] = model.CircuitMetadata{
		ExplicitMetadata: emd,
		ImplicitMetadata: model.ImplicitMetadata{
			ID:      circuitID,
			Creator: creator,
			Version: m.v,
		},
	}
}
