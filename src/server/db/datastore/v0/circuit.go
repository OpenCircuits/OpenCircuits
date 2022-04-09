package v0

import (
	"cloud.google.com/go/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/common"
	"google.golang.org/api/iterator"
)

type DatastoreDB (common.DatastoreDB)

func (d DatastoreDB) EnumerateCircuits(userId string) ([]DBCircuitID, []DatastoreCircuit, error) {
	query := datastore.NewQuery(CircuitKind).Filter("Owner =", userId).Filter("Hidden =", false)
	it := d.Client.Run(d.Ctx, query)
	var ids []DBCircuitID
	var circuits []DatastoreCircuit
	for {
		var x DatastoreCircuit
		key, err := it.Next(&x)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, nil, err
		}

		circuits = append(circuits, x)
		ids = append(ids, newID(key.Name))
	}
	return ids, circuits, nil
}

func LoadCircuitInTx(tx *datastore.Transaction, id DBCircuitID) (DatastoreCircuit, error) {
	var dCircuit DatastoreCircuit
	err := tx.Get(id.toNameKey(), &dCircuit)
	return dCircuit, err
}

func HideCircuitInTx(tx *datastore.Transaction, id DBCircuitID, circuit DatastoreCircuit) error {
	circuit.Hidden = true
	_, err := tx.Put(id.toNameKey(), &circuit)
	if err != nil {
		return err
	}
	// Delete the empty circuit with the ID key
	return tx.Delete(id.toIDKey())
}

func (d DatastoreDB) DeleteCircuit(id DBCircuitID) error {
	err := d.Client.Delete(d.Ctx, id.toNameKey())
	if err != nil {
		return err
	}
	return d.Client.Delete(d.Ctx, id.toIDKey())
}

// Insert operation for testing
func (d DatastoreDB) UpsertCircuit(id DBCircuitID, c DatastoreCircuit) {
	// Emulate bug with empty circuit
	var emptyCircuit DatastoreCircuit
	_, err := d.Client.Put(d.Ctx, id.toIDKey(), &emptyCircuit)
	if err != nil {
		panic(err)
	}

	// Real circuit has a name key
	_, err = d.Client.Put(d.Ctx, id.toNameKey(), &c)
	if err != nil {
		panic(err)
	}
}
