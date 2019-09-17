package model

// CircuitMetadata contains the non-content parts of the circuit
type CircuitMetadata struct {
	ID        CircuitId `xml:"id",json:"id"`
	Name      string    `xml:"name",json:"name"`
	Owner     UserId    `xml:"owner",json:"owner"`
	Desc      string    `xml:"desc",json:"desc"`
	Thumbnail string    `xml:"thumbnail",json:"thumbnail"`
	Version   string    `xml:"version",json:"version"`
}

// CircuitDesigner is a simple string until we need server-side analysis of circuit content
type CircuitDesigner struct {
	RawContent string `xml:",innerxml"`
}

// Circuit is the top-level model
type Circuit struct {
	Metadata CircuitMetadata `xml:"metadata"`
	Designer CircuitDesigner `xml:"contents"`
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
