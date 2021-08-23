package doc

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

// DocumentManager keeps track of live documents
type DocumentManager struct {
	openSender chan<- openRequest
}

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

// NewDocumentManager launches the document manager
func NewDocumentManager(factories DriverFactories) DocumentManager {
	dm, st := newDocumentManager(factories)
	go st.manage()
	return dm
}

// Get fetches the document handle for the given CircuitID and opens it if not
func (dm DocumentManager) Get(circuitID model.CircuitID) (Document, error) {
	ch := make(chan openResponse)
	dm.openSender <- openRequest{
		CircuitID: circuitID,
		Resp:      ch,
	}
	resp := <-ch
	return resp.Document, resp.Error
}

type openResponse struct {
	Document Document
	Error    error
}

type openRequest struct {
	CircuitID model.CircuitID
	// Resp must be non-null
	Resp chan<- openResponse
}

type dmState struct {
	factories DriverFactories

	liveDocuments map[model.CircuitID]Document
	doneListener  chan model.CircuitID
	openListener  <-chan openRequest
}

func newDocumentManager(factories DriverFactories) (DocumentManager, dmState) {
	done := make(chan model.CircuitID, 10)
	open := make(chan openRequest, 10)

	dm := DocumentManager{
		openSender: open,
	}
	state := dmState{
		factories: factories,

		liveDocuments: make(map[model.CircuitID]Document),
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
			if ok {
				req.Resp <- openResponse{d, nil}
				break
			}

			d = NewDocument(DocumentParam{
				CircuitID: req.CircuitID,
				Drivers:   st.factories.New(req.CircuitID),
				OnClose: func() {
					st.doneListener <- req.CircuitID
				},
			})
			st.liveDocuments[req.CircuitID] = d

			req.Resp <- openResponse{d, nil}
		case cid := <-st.doneListener:
			delete(st.liveDocuments, cid)
		}
	}
}
