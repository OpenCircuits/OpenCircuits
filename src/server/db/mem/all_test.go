package mem

import (
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/db"
)

func TestVolatileCircuit(t *testing.T) {
	driver := NewVolatileCircuitDB()
	db.TestCircuitDB(t, driver.Create())
}
func TestCircuit(t *testing.T) {
	driver := NewCircuitDB("/tmp/AccessTest.json")
	db.TestCircuitDB(t, driver.Create())
}
