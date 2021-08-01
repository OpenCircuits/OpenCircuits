package doc

import (
	"testing"
	"time"
)

func TestManagerGetDocument(t *testing.T) {
	dm := newDocumentManager()
	doc, err := dm.Get("AAAA")
	if err != nil {
		t.Error("unexpected error getting document by ID")
	}

	if dm.liveDocuments[doc.CircuitID].CircuitID != "AAAA" {
		t.Error("Added document had wrong circuit ID")
	}
}

func TestManagerCloseDocument(t *testing.T) {
	dm := newDocumentManager()
	doc, err := dm.Get("AAAA")
	if err != nil {
		t.Error("unexpected error getting document by ID")
	}

	// Manually close the created document
	dm.doneListener <- doc.CircuitID
	go dm.closer()

	// Give the closer some time to do its job
	<-time.After(5 * time.Microsecond)

	// Make sure it was closed
	dm.documentLock.RLock()
	defer dm.documentLock.RUnlock()
	if _, ok := dm.liveDocuments[doc.CircuitID]; ok {
		t.Error("Expected document to be closed")
	}
}
