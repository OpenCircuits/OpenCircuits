package doc

import (
	"testing"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

func TestManagerGetDocument(t *testing.T) {
	dm, st := newDocumentManager()
	go st.manage()

	circuitID := model.NewCircuitID()
	doc, err := dm.Get(circuitID)
	if err != nil {
		t.Error("unexpected error getting document by ID")
	}

	if st.liveDocuments[doc.CircuitID].CircuitID != circuitID {
		t.Error("Added document had wrong circuit ID")
	}
}

func TestManagerCloseDocument(t *testing.T) {
	dm, st := newDocumentManager()
	go st.manage()

	circuitID := model.NewCircuitID()
	doc, err := dm.Get(circuitID)
	if err != nil {
		t.Error("unexpected error getting document by ID")
	}

	// Manually close the created document
	st.doneListener <- doc.CircuitID

	// Give the closer some time to do its job
	<-time.After(5 * time.Microsecond)

	// Make sure it was closed
	if _, ok := st.liveDocuments[doc.CircuitID]; ok {
		t.Error("Expected document to be closed")
	}
}
