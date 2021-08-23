package mem

import (
	"sort"
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type msMap = map[model.CircuitID]*memMilestoneDriver

type memMilestoneFactory struct {
	drivers msMap
	m       sync.Mutex
}

type memMilestoneDriver struct {
	ms map[uint64]model.MilestoneCircuit
}

// NewMilestoneFactory creates a thread-safe in-memory milestone factory for testing
func NewMilestoneFactory() model.MilestoneDriverFactory {
	return &memMilestoneFactory{
		drivers: make(msMap),
		m:       sync.Mutex{},
	}
}

func (f *memMilestoneFactory) NewMilestoneDriver(circuitID model.CircuitID) (model.MilestoneDriver, error) {
	f.m.Lock()
	defer f.m.Unlock()

	if d, ok := f.drivers[circuitID]; ok {
		return d, nil
	}

	d := &memMilestoneDriver{
		ms: make(map[uint64]model.MilestoneCircuit),
	}
	f.drivers[circuitID] = d
	return d, nil
}

func (m *memMilestoneDriver) AddMilestone(milestone model.MilestoneCircuit) {
	m.ms[milestone.LogClock] = milestone
}

func (m *memMilestoneDriver) DeleteMilestone(clock uint64) {
	delete(m.ms, clock)
}

func (m *memMilestoneDriver) Milestone(clock uint64) (model.MilestoneCircuit, bool) {
	a, b := m.ms[clock]
	return a, b
}

func (m *memMilestoneDriver) LatestMilestone() (model.MilestoneCircuit, bool) {
	var ms model.MilestoneCircuit
	found := false
	for k, v := range m.ms {
		if k > ms.LogClock {
			ms = v
			found = true
		}
	}
	return ms, found
}

func (m *memMilestoneDriver) EnumerateMilestones() []model.MilestoneCircuitMetadata {
	vs := make([]model.MilestoneCircuitMetadata, 0, len(m.ms))
	for _, v := range m.ms {
		vs = append(vs, v.MilestoneCircuitMetadata)
	}
	sort.Slice(vs, func(i, j int) bool {
		return vs[i].LogClock < vs[i].LogClock
	})
	return vs
}
