package v0_1

import (
	"errors"
	"fmt"

	"cloud.google.com/go/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/common"
)

type DatastoreDB (common.DatastoreDB)

func (d DatastoreDB) EnumerateUser(user string) ([]DBCircuitID, []Circuit, error) {
	var ids []DBCircuitID
	var circuits []Circuit

	// NOTE: When Datastore became Firestore in Datastore mode, ancestor-less
	//	queries in transactions became legal
	_, err := d.Client.RunInTransaction(d.Ctx, func(tx *datastore.Transaction) error {
		// Query permissions and get ancestors via their returned keys
		query := datastore.NewQuery(CircuitPermissionKind).
			Filter("Owner =", user).KeysOnly().Transaction(tx)

		keys, err := d.Client.GetAll(d.Ctx, query, nil)
		if err != nil {
			return err
		}

		ids = make([]DBCircuitID, len(keys))
		circuitKeys := make([]*datastore.Key, len(keys))
		for i, k := range keys {
			if k.Parent != nil {
				ids[i] = DBCircuitID(k.Parent.ID)
				circuitKeys[i] = k.Parent
			} else {
				fmt.Println("Unexpected orphain permission entry")
			}
		}

		// Idempotence of GetMulti
		circuits = make([]Circuit, len(keys))
		return tx.GetMulti(circuitKeys, circuits)
	}, datastore.ReadOnly)
	return ids, circuits, err
}

func (d DatastoreDB) LoadCircuit(id DBCircuitID) (Circuit, []ContentChunk, error) {
	load := func() (Circuit, []ContentChunk, error) {
		circuitKey := id.toDSKey()

		var circuit Circuit
		var contentHeader ContentHeader
		_, err := d.Client.RunInTransaction(d.Ctx, func(tx *datastore.Transaction) error {

			// Load metadata first
			err := tx.Get(circuitKey, &circuit)
			if err != nil {
				return err
			}

			// Load the content header
			return tx.Get(NewContentHeaderKey(circuitKey), &contentHeader)
		}, datastore.ReadOnly)
		if err != nil {
			return Circuit{}, nil, err
		}

		// Load the content
		chunks, err := d.loadContent(circuitKey, contentHeader.ContentID)
		return circuit, chunks, err
	}

	// Load the content based on the content header.  Try 5 times before erroring out.
	// This will cause 500-type errors in high-contention scenarios
	var circuit Circuit
	var contentChunks []ContentChunk
	var err error
	for i := 0; i < 5; i += 1 {
		circuit, contentChunks, err = load()
		if err == nil || err == datastore.ErrNoSuchEntity {
			break
		}
	}
	return circuit, contentChunks, err
}

func (d DatastoreDB) loadContent(key *datastore.Key, contentID ContentID) ([]ContentChunk, error) {
	query := datastore.NewQuery(CircuitContentKind).Ancestor(key).Filter("ContentID =", string(contentID)).KeysOnly()
	keys, err := d.Client.GetAll(d.Ctx, query, nil)
	if err != nil {
		return nil, err
	}

	// Load each chunk linearly, failing if any fails.  This works very poorly in high-contention scenarios.
	chunks := make([]ContentChunk, len(keys))
	for i, k := range keys {
		err = d.Client.Get(d.Ctx, k, &chunks[i])
		if err == datastore.ErrNoSuchEntity {
			// no-such-entity errors at this layer are not 404-type errors
			return nil, errors.New("contention while reading circuit content")
		} else if err != nil {
			return nil, err
		}
	}
	return chunks, nil
}

func (d DatastoreDB) deleteContentInTx(tx *datastore.Transaction, key *datastore.Key, contentID ContentID) error {
	query := datastore.NewQuery(CircuitContentKind).Ancestor(key).Filter("ContentID =", string(contentID)).
		KeysOnly().Transaction(tx)
	keys, err := d.Client.GetAll(d.Ctx, query, nil)
	if err != nil {
		return err
	}
	return tx.DeleteMulti(keys)
}

func (d DatastoreDB) uploadContent(key *datastore.Key, contentChunks []ContentChunk) (ContentID, []*datastore.Key, error) {
	contentID := NewContentID()
	contentKeys := make([]*datastore.Key, len(contentChunks))
	for i := range contentKeys {
		contentChunks[i].ContentID = contentID
		k, err := d.Client.Put(d.Ctx, datastore.IncompleteKey(CircuitContentKind, key), &contentChunks[i])
		if err != nil {
			_ = d.Client.DeleteMulti(d.Ctx, contentKeys)
			return "", nil, err
		}
		contentKeys[i] = k
	}
	return contentID, contentKeys, nil
}

func InsertCircuitInTx(tx *datastore.Transaction, id DBCircuitID, circuit Circuit, permissions Permissions, content ContentChunk) error {
	key := id.toDSKey()
	_, err := tx.Put(key, &circuit)
	if err != nil {
		return err
	}

	// Insert permissions
	_, err = tx.Put(datastore.IncompleteKey(CircuitPermissionKind, key), &permissions)
	if err != nil {
		return err
	}

	// Insert content
	content.ContentID = NewContentID()
	_, err = tx.Put(datastore.IncompleteKey(CircuitContentKind, key), &content)
	if err != nil {
		return err
	}

	// Insert content header
	_, err = tx.Put(NewContentHeaderKey(key), &ContentHeader{
		Clock:     1,
		ContentID: content.ContentID,
	})
	return err
}

func (d DatastoreDB) InsertCircuit(circuit FullCircuit) (DBCircuitID, DBPermID, error) {
	// Initial insert can't be done in transaction, but until permissions inserted
	//	no one can query the circuit anyway, so its not a problem
	key, err := d.Client.Put(d.Ctx, datastore.IncompleteKey(CircuitKind, nil), &circuit.Circuit)
	if err != nil {
		return 0, 0, err
	}

	// Upload circuit content first
	contentID, contentKeys, err := d.uploadContent(key, circuit.Content)
	if err != nil {
		return 0, 0, err
	}

	var permKey *datastore.Key
	_, err = d.Client.RunInTransaction(d.Ctx, func(tx *datastore.Transaction) error {
		// Insert permissions
		permKey, err = d.Client.Put(d.Ctx, datastore.IncompleteKey(CircuitPermissionKind, key), &circuit.Permissions)
		if err != nil {
			return err
		}

		// Insert content header
		_, err := tx.Put(NewContentHeaderKey(key), &ContentHeader{
			Clock:     1,
			ContentID: contentID,
		})
		return err
	})
	if err != nil {
		// Delete content
		err1 := d.Client.DeleteMulti(d.Ctx, contentKeys)
		if err1 != nil {
			fmt.Printf("Failed to clean up after failed Insert: %d (%v)\n", key.ID, err1)
		}
		// Delete root object
		err1 = d.Client.Delete(d.Ctx, key)
		if err1 != nil {
			fmt.Printf("Failed to clean up after failed Insert: %d (%v)\n", key.ID, err1)
		}
		return 0, 0, err
	}

	return DBCircuitID(key.ID), DBPermID(permKey.ID), nil
}

func (d DatastoreDB) UpdateCircuit(id DBCircuitID, circuit Circuit, contentChunks []ContentChunk) error {
	key := id.toDSKey()

	// Upload content FIRST, then atomically update the circuit
	contentID, contentKeys, err := d.uploadContent(key, contentChunks)
	if err != nil {
		return err
	}

	// update, must be in transaction
	_, err = d.Client.RunInTransaction(d.Ctx, func(tx *datastore.Transaction) error {
		key := id.toDSKey()

		// Update metadata
		_, err := tx.Put(key, &circuit)
		if err != nil {
			return err
		}

		// Update ContentHeader to new clock / contentID
		var contentHeader ContentHeader
		contentHeaderKey := NewContentHeaderKey(key)
		err = tx.Get(contentHeaderKey, &contentHeader)
		if err != nil {
			return err
		}
		previousContentID := contentHeader.ContentID
		contentHeader.ContentID = contentID
		contentHeader.Clock += 1
		_, err = tx.Put(contentHeaderKey, &contentHeader)
		if err != nil {
			return err
		}

		// Delete all content from previous clock
		return d.deleteContentInTx(tx, key, previousContentID)
	})
	if err != nil {
		err1 := d.Client.DeleteMulti(d.Ctx, contentKeys)
		if err1 != nil {
			fmt.Printf("Failed to clean up after failed Update: %d (%v)\n", key.ID, err1)
		}
	}
	return err
}

func (d DatastoreDB) DeleteCircuit(id DBCircuitID) error {
	key := id.toDSKey()

	_, err := d.Client.RunInTransaction(d.Ctx, func(tx *datastore.Transaction) error {
		// Delete metadata
		err := tx.Delete(key)
		if err == datastore.ErrNoSuchEntity {
			return nil
		} else if err != nil {
			return err
		}

		// Delete content header
		err = tx.Delete(NewContentHeaderKey(key))
		if err != nil {
			return err
		}

		// Delete perms
		q := datastore.NewQuery(CircuitPermissionKind).Ancestor(key).KeysOnly().Transaction(tx)
		keys, err := d.Client.GetAll(d.Ctx, q, nil)
		if err != nil {
			return err
		}
		err = tx.DeleteMulti(keys)
		if err != nil {
			return err
		}

		// Delete all content
		query := datastore.NewQuery(CircuitContentKind).Ancestor(key).KeysOnly().Transaction(tx)
		keys, err = d.Client.GetAll(d.Ctx, query, nil)
		if err != nil {
			return err
		}
		return tx.DeleteMulti(keys)
	})
	return err
}

func (d DatastoreDB) LoadPermissions(id DBCircuitID) (DBPermID, Permissions, error) {
	q := datastore.NewQuery(CircuitPermissionKind).Ancestor(id.toDSKey())
	var perms []Permissions
	keys, err := d.Client.GetAll(d.Ctx, q, &perms)
	if err != nil {
		return 0, Permissions{}, err
	}
	if len(perms) == 0 {
		return 0, Permissions{}, datastore.ErrNoSuchEntity
	}
	return DBPermID(keys[0].ID), perms[0], nil
}

func (d DatastoreDB) UpdatePermissions(circuitID DBCircuitID, id DBPermID, perm Permissions) error {
	_, err := d.Client.Put(d.Ctx, id.toDSKey(circuitID), &perm)
	return err
}
