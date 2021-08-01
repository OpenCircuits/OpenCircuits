package doc

import (
	"sync"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// DocumentManager keeps track of live documents
type DocumentManager struct {
	liveDocuments map[model.CircuitId]Document
	documentLock  *sync.RWMutex
	doneListener  chan model.CircuitId
}

func newDocumentManager() *DocumentManager {
	dm := &DocumentManager{
		liveDocuments: make(map[model.CircuitId]Document),
		documentLock:  &sync.RWMutex{},
		doneListener:  make(chan model.CircuitId, 10),
	}

	return dm
}

func NewDocumentManager() *DocumentManager {
	dm := newDocumentManager()
	go dm.closer()
	return dm
}

func (dm *DocumentManager) closer() {
	for cid := range dm.doneListener {
		dm.documentLock.Lock()
		delete(dm.liveDocuments, cid)
		dm.documentLock.Unlock()
	}
}

// Get gets the channel to send messages to for a particular document
func (dm *DocumentManager) Get(circuitID model.CircuitId) (Document, error) {
	dm.documentLock.RLock()
	d, ok := dm.liveDocuments[circuitID]
	dm.documentLock.RUnlock()
	if ok {
		// document is already live
		return d, nil
	}

	// Document is not live, must bootstrap it first
	d = NewDocument(circuitID, dm.doneListener)

	// Add the new document to the map
	dm.documentLock.Lock()
	dm.liveDocuments[circuitID] = d
	dm.documentLock.Unlock()

	return d, nil
}
