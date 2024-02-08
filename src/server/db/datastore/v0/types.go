package v0

import (
	"strconv"

	"cloud.google.com/go/datastore"
)

const CircuitKind = "Circuit"

// A flat data structure to load data to/from
type DatastoreCircuit struct {
	Name            string
	Owner           string
	Desc            string
	Thumbnail       string `datastore:",noindex"`
	Version         string
	CircuitDesigner string `datastore:",noindex"`

	// Added after-the-fact for hiding entries under normal queries.  Circuits
	// marked as "Hidden" are safe to delete, but keep them around for safety.
	Hidden bool
}

type DBCircuitID int64

// Circuits stored under name keys
func (id DBCircuitID) toNameKey() *datastore.Key {
	return datastore.NameKey(CircuitKind, strconv.FormatInt(int64(id), 16), nil)
}

func (id DBCircuitID) toIDKey() *datastore.Key {
	return datastore.IDKey(CircuitKind, int64(id), nil)
}

func newID(name string) DBCircuitID {
	id, _ := strconv.ParseInt(name, 16, 64)
	return DBCircuitID(id)
}
