package doc

import (
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot"
)

type DriverFactories struct {
	model.ChangelogDriverFactory
	model.MilestoneDriverFactory
	model.CircuitDriver
}

// New creates instances of each of the drivers
func (df DriverFactories) New(circuitID model.CircuitID) DocumentDrivers {
	return DocumentDrivers{
		ChangelogDriver: df.NewChangelogDriver(circuitID),
		MilestoneDriver: df.NewMilestoneDriver(circuitID),
		CircuitDriver:   df.CircuitDriver,
	}
}

// DocumentManager keeps track of live documents
//	NOTE: Contention can be reduced at zero-cost if the circuit ID space is partitioned
type DocumentManager struct {
	factories     DriverFactories
	liveDocuments map[model.CircuitID]*Document
	mut           sync.Mutex
}

// NewDocumentManager launches the document manager
func NewDocumentManager(factories DriverFactories) *DocumentManager {
	return &DocumentManager{
		factories:     factories,
		liveDocuments: make(map[model.CircuitID]*Document),
	}
}

// Get fetches the document handle for the given CircuitID and opens it if not
func (dm *DocumentManager) Get(circuitID model.CircuitID) ot.Document {
	dm.mut.Lock()
	defer dm.mut.Unlock()

	// Document already live
	if d, ok := dm.liveDocuments[circuitID]; ok {
		return d
	}

	// Document not live yet
	d := NewDocument(DocumentParam{
		CircuitID: circuitID,
		Drivers:   dm.factories.New(circuitID),
		OnClose:   func() { dm.delete(circuitID) },
	})
	dm.liveDocuments[circuitID] = d
	return d
}

func (dm *DocumentManager) delete(circuitID model.CircuitID) {
	dm.mut.Lock()
	defer dm.mut.Unlock()

	delete(dm.liveDocuments, circuitID)
}
