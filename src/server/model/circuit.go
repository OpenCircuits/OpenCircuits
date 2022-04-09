package model

// CircuitStorageInterface represents an interface to a circuit storage system that simply performs the requested operation.   Implementations
// do not modify the provided circuits.
type CircuitStorageInterface interface {
	// Tries to load a circuit with a given id
	LoadCircuit(id CircuitID) *Circuit
	// gets all circuits accessible to a user
	EnumerateCircuits(userID UserID) []OldCircuitMetadata
	// Updates an existing circuit
	UpdateCircuit(c Circuit)
	// Makes a new blank circuit
	NewCircuit() Circuit
	// Deletes a circuit by ID
	DeleteCircuit(id CircuitID)
	// Releases the resources the interface holds.  No guarantees are made about the state of this object beyond this
	// point.  Call this when done using the interface.
	Close()
}

// CircuitStorageInterfaceFactory generates interfaces to a storage systems, but each interface returned should be associated with the same storage
//	system.  This is not required to generate unique instances if that is not required by the underlying storage system
type CircuitStorageInterfaceFactory interface {
	CreateCircuitStorageInterface() CircuitStorageInterface
}

// OldCircuitMetadata contains the non-content parts of the circuit
type OldCircuitMetadata struct {
	ID        CircuitID `json:"id"`
	Name      string    `json:"name"`
	Owner     UserID    `json:"owner"`
	Desc      string    `json:"desc"`
	Thumbnail string    `json:"thumbnail"`
	Version   string    `json:"version"`
}

// Circuit is the top-level model
type Circuit struct {
	Metadata OldCircuitMetadata `json:"metadata"`
	Designer string             `json:"contents"`
}

// Update takes a client-supplied circuit and updates the server-side data.  This allows the circuit model to control
// what parts of the circuit may be overwritten
func (c *Circuit) Update(newCircuit Circuit) {
	c.Designer = newCircuit.Designer
	c.Metadata.Update(newCircuit.Metadata)
}

// Update same as above
func (m *OldCircuitMetadata) Update(newMetadata OldCircuitMetadata) {
	m.Name = newMetadata.Name
	m.Desc = newMetadata.Desc
	m.Thumbnail = newMetadata.Thumbnail
	m.Version = newMetadata.Version
}
