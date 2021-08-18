package doc

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// DocumentManager keeps track of live documents
type DocumentManager struct {
	openSender chan<- openRequest
}

func NewDocumentManager() DocumentManager {
	dm, st := newDocumentManager()
	go st.manage()
	return dm
}

// Get fetches the document handle for the given CircuitID and opens it if not
func (dm DocumentManager) Get(circuitID model.CircuitId) (Document, error) {
	r := make(chan Document)
	dm.openSender <- openRequest{
		CircuitID: circuitID,
		Resp:      r,
	}
	return <-r, nil
}

type openRequest struct {
	CircuitID model.CircuitId
	// Resp must be non-null
	Resp chan<- Document
}

type dmState struct {
	liveDocuments map[model.CircuitId]Document
	doneListener  chan model.CircuitId
	openListener  <-chan openRequest
}

func newDocumentManager() (DocumentManager, dmState) {
	done := make(chan model.CircuitId, 10)
	open := make(chan openRequest, 10)

	dm := DocumentManager{
		openSender: open,
	}
	state := dmState{
		liveDocuments: make(map[model.CircuitId]Document),
		doneListener:  done,
		openListener:  open,
	}

	return dm, state
}

func (st dmState) manage() {
	// If single-threaded is too slow, the CircuitID-space could be partitioned
	//	into multiple sub-spaces and identical logic run on each
	for {
		select {
		case req := <-st.openListener:
			d, ok := st.liveDocuments[req.CircuitID]
			if !ok {
				d = NewDocument(req.CircuitID, st.doneListener)
				st.liveDocuments[req.CircuitID] = d
			}
			req.Resp <- d
		case cid := <-st.doneListener:
			delete(st.liveDocuments, cid)
		}
	}
}
