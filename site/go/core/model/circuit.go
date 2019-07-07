package model

// non-contents parts of the circuit
type CircuitMetadata struct {
	Id      CircuitId `xml:"id,attr"`
	Version int       `xml:"id,attr"`
	Name    string    `xml:"name,attr"`
	Owner   UserId    `xml:"owner,attr"`
}

// Until we need server-side analysis of circuit content, this is fine
type CircuitDesigner = string

// We use a string for the currently xml content of the circuit
//	and make it distinct from other data like the id or name
type Circuit struct {
	Metadata CircuitMetadata `xml:"metadata"`
	Designer CircuitDesigner `xml:"content"`
}

func (c *Circuit) Update(newCircuit Circuit) {
	c.Designer = newCircuit.Designer
	c.Metadata.Update(newCircuit.Metadata)
}

func (m *CircuitMetadata) Update(newMetadata CircuitMetadata) {
	m.Version = newMetadata.Version
	m.Name = newMetadata.Name
	// For now, we don't support ownership transfer
}
