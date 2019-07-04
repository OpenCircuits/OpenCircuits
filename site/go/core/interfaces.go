package core

import "github.com/OpenCircuits/OpenCircuits/site/go/core/model"

// TODO: errors that are not a result of improper usage of the client will cause panics

// Represents an interface to a circuit storage system that simply performs the requested operation.   Implementations
// do not modify the provided circuits.
type CircuitStorageInterface interface {
	// Tries to load a circuit with a given id
	LoadCircuit(id CircuitId) *model.Circuit
	// gets all circuits accessible to a user
	EnumerateCircuits(userId UserId) []model.CircuitMetadata
	// Updates an existing circuit
	UpdateCircuit(c model.Circuit)
	// Makes a new blank circuit
	NewCircuit() model.Circuit
	// Releases the resources the interface holds.  No guarantees are made about the state of this object beyond this
	// point.  Call this when done using the interface.
	Close()
}

// Generates interfaces to a storage systems, but each interface returned should be associated with the same storage
//	system.  This is not required to generate unique instances if that is not required by the underlying storage system
type CircuitStorageInterfaceFactory interface {
	CreateCircuitStorageInterface() CircuitStorageInterface
}

// Since local interfaces to databases are MT-safe, the pooled idea would be valid for non-sql,
//	remote connections to other processes / nodes I guess
