package interfaces

import "github.com/OpenCircuits/OpenCircuits/site/go/core/model"

// NOTE: These functions should never fail, so errors are handled via 'panic', which yield 500-type errors

// Represents an interface to a circuit storage system that simply performs the requested operation.   Implementations
// do not modify the provided circuits.
type CircuitStorageInterface interface {
	// Tries to load a circuit with a given id
	LoadCircuit(id model.CircuitId) *model.Circuit
	// gets all circuits accessible to a user
	EnumerateCircuits(userId model.UserId) []model.CircuitMetadata
	// Updates an existing circuit
	UpdateCircuit(c model.Circuit)
	// Makes a new blank circuit
	NewCircuit() model.Circuit
	// Deletes a circuit by ID
	DeleteCircuit(id model.CircuitId)
	// Releases the resources the interface holds.  No guarantees are made about the state of this object beyond this
	// point.  Call this when done using the interface.
	Close()
}

// Generates interfaces to a storage systems, but each interface returned should be associated with the same storage
//	system.  This is not required to generate unique instances if that is not required by the underlying storage system
type CircuitStorageInterfaceFactory interface {
	CreateCircuitStorageInterface() CircuitStorageInterface
}
