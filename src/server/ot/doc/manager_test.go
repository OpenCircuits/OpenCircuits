package doc

import (
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/drivers/mem"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

var mockFactories DriverFactories = DriverFactories{
	ChangelogDriverFactory: mem.NewChangelogFactory(),
	MilestoneDriverFactory: mem.NewMilestoneFactory(),
	CircuitDriver:          mem.NewCircuitDriver("INVALID"),
}

func TestManagerGetDocument(t *testing.T) {
	dm := NewDocumentManager(mockFactories)

	circuitID := model.NewCircuitID()
	doc := dm.Get(circuitID)

	if dm.liveDocuments[doc.CircuitID].CircuitID != circuitID {
		t.Error("Added document had wrong circuit ID")
	}

	_ = dm.Get(circuitID)
	if len(dm.liveDocuments) > 1 {
		t.Error("Duplicate document for same circuit ID")
	}
}

func TestManagerCloseDocument(t *testing.T) {
	dm := NewDocumentManager(mockFactories)

	circuitID := model.NewCircuitID()
	doc := dm.Get(circuitID)

	// Manually close the created document
	dm.delete(doc.CircuitID)

	// Make sure it was closed
	if len(dm.liveDocuments) != 0 {
		t.Error("Expected document to be closed")
	}
}
