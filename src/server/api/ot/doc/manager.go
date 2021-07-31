package doc

import (
	"sync"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// DocumentManager keeps track of live documents
type DocumentManager struct {
	liveDocuments map[model.CircuitId]*Document
	documentLock  *sync.RWMutex
	doneListener  chan model.CircuitId
}

func (dm *DocumentManager) livenessListener() {

}

func NewDocumentManager() *DocumentManager {
	dm := &DocumentManager{
		liveDocuments: make(map[string]*Document),
		documentLock:  &sync.RWMutex{},
	}

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
func (dm *DocumentManager) Get(circuitID model.CircuitId) (chan<- MessageWrapper, error) {
	dm.documentLock.RLock()
	d, ok := dm.liveDocuments[circuitID]
	dm.documentLock.Unlock()
	if ok {
		// document is already live
		return d.recv, nil
	}

	// Document is not live, must bootstrap it first
	d = &Document{
		CircuitID: circuitID,
		log:       Log{}, // TODO: This needs to be loaded
		recv:      make(chan MessageWrapper),
		liveTime:  5 * time.Minute,
		done:      dm.doneListener,
	}
	go d.messageLoop()

	// Add the new document to the map
	dm.documentLock.Lock()
	dm.liveDocuments[circuitID] = d
	dm.documentLock.Unlock()

	return d.recv, nil
}
