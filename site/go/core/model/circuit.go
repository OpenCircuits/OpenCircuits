package model

import "github.com/OpenCircuits/OpenCircuits/site/go/core"

// non-contents parts of the circuit
type CircuitMetadata struct {
	Id    core.CircuitId `json:"id"`
	Name  string         `json:"name"`
	Owner core.UserId    `json:"owner"`
}

// We use a string for the currently xml content of the circuit
//	and make it distinct from other data like the id or name
type Circuit struct {
	Metadata CircuitMetadata `json:"metadata"`
	Content  string          `json:"content"`
}

