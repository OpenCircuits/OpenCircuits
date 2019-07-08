package model

// non-contents parts of the circuit
type CircuitMetadata struct {
	Id      CircuitId `xml:"id"`
	Version int       `xml:"version"`
	Name    string    `xml:"name"`
	Owner   UserId    `xml:"owner"`
}

// Until we need server-side analysis of circuit content, this is fine
type CircuitDesigner struct {
	RawContent string `xml:",innerxml"`
}

// We use a string for the currently xml content of the circuit
//	and make it distinct from other data like the id or name
type Circuit struct {
	Metadata CircuitMetadata `xml:"metadata"`
	Designer CircuitDesigner `xml:"designer"`
}

func (c *Circuit) Update(newCircuit Circuit) {
	c.Designer = newCircuit.Designer
	c.Metadata.Update(newCircuit.Metadata)
}

func (m *CircuitMetadata) Update(newMetadata CircuitMetadata) {
	m.Name = newMetadata.Name
	m.Version++
	// For now, we don't support ownership transfer
}
