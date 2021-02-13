package model

// CircuitMetadata contains the non-content parts of the circuit
type CircuitMetadata struct {
	ID        CircuitId `json:"id"`
	Name      string    `json:"name"`
	Owner     UserId    `json:"owner"`
	Desc      string    `json:"desc"`
	Thumbnail string    `json:"thumbnail"`
	Version   string    `json:"version"`
}

// Circuit is the top-level model
type Circuit struct {
	Metadata CircuitMetadata `json:"metadata"`
	Designer string          `json:"contents"`
}

// Update takes a client-supplied circuit and updates the server-side data.  This allows the circuit model to control
// what parts of the circuit may be overwritten
func (c *Circuit) Update(newCircuit Circuit) {
	c.Designer = newCircuit.Designer
	c.Metadata.Update(newCircuit.Metadata)
}

// Update same as above
func (m *CircuitMetadata) Update(newMetadata CircuitMetadata) {
	m.Name = newMetadata.Name
	m.Desc = newMetadata.Desc
	m.Thumbnail = newMetadata.Thumbnail
	m.Version = newMetadata.Version
}
