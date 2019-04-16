package model

import (
	"encoding/json"
	"github.com/OpenCircuits/OpenCircuits/site/go/db"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/mem"
)

type CircuitMetadata struct {
	Name    string	`json:"name"`
	Owner   string  `json:"owner"`
}

type Circuit struct {
	Id       string          `json:"id"`
	Metadata CircuitMetadata `json:"metadata"`
	Content  string          `json:"content"`
}

var circuitDb db.StringStore

func init() {
	// TODO: make this use something with persistence
	circuitDb = mem.NewMemDb()
}

func NewCircuit(id string, owner string) Circuit {
	return Circuit{Id: id, Metadata: CircuitMetadata{Name: id, Owner:owner}}
}

func LoadCircuit(id string) (Circuit, error) {
	entry, err := circuitDb.LoadString(id)
	if err != nil {
		return Circuit{}, err
	}
	var c Circuit
	err = json.Unmarshal([]byte(entry.Value), &c)
	if err != nil {
		return Circuit{}, err
	}
	return c, nil
}

func (c Circuit) Save() {
	s, _ := json.Marshal(c)
	_ = circuitDb.StoreString(c.Id, string(s))
}
