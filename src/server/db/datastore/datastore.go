package datastore

import (
	"context"
	"errors"
	"fmt"
	"os"

	"cloud.google.com/go/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/common"
	v0 "github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/v0"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/v0_1"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"google.golang.org/api/option"
)

type (
	DBCircuit v0_1.Circuit
)

type DatastoreDBFactory (common.DatastoreDB)

func (f DatastoreDBFactory) create() DatastoreDB {
	return newDatastoreDB(common.DatastoreDB(f))
}

func (f DatastoreDBFactory) Create() model.CircuitDB {
	return f.create()
}

func NewCircuitDBFactory(ctx context.Context, ops ...option.ClientOption) (model.CircuitDBFactory, error) {
	projectId := os.Getenv("DATASTORE_PROJECT_ID")
	if projectId == "" {
		return nil, errors.New("DATASTORE_PROJECT_ID environment variable must be set")
	}
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &DatastoreDBFactory{Client: ds, Ctx: ctx}, nil
}

func newEmuCircuitDBFactory(ctx context.Context, projectId string, emuHost string, ops ...option.ClientOption) (*DatastoreDBFactory, error) {
	_ = os.Setenv("DATASTORE_EMULATOR_HOST", emuHost)
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &DatastoreDBFactory{Client: ds, Ctx: ctx}, nil
}

// Creates a new GCP datastore instance for use with the local datastore emulator
func NewEmuCircuitDBFactory(ctx context.Context, projectId string, emuHost string, ops ...option.ClientOption) (model.CircuitDBFactory, error) {
	return newEmuCircuitDBFactory(ctx, projectId, emuHost, ops...)
}

// LIMITS
// 1MB / datastore entity
// 10MiB / transaction
// 1500 / indexed field
type DatastoreDB struct {
	keys map[v0_1.DBCircuitID]v0_1.DBPermID
	common.DatastoreDB
}

func newDatastoreDB(db common.DatastoreDB) DatastoreDB {
	return DatastoreDB{
		keys:        make(map[v0_1.DBCircuitID]v0_1.DBPermID),
		DatastoreDB: db,
	}
}

func (ds DatastoreDB) getPermID(cID v0_1.DBCircuitID) v0_1.DBPermID {
	permID, ok := ds.keys[cID]
	if !ok {
		// Slow path, should never be hit
		fmt.Printf("Expected permission key to be cached for %x\n", cID)
		_, err := ds.loadPermLatest(cID)
		if err != nil {
			panic(err)
		}
	}
	return permID
}

func (ds DatastoreDB) v0() v0.DatastoreDB {
	return v0.DatastoreDB(ds.DatastoreDB)
}

func (ds DatastoreDB) v0_1() v0_1.DatastoreDB {
	return v0_1.DatastoreDB(ds.DatastoreDB)
}

func (ds DatastoreDB) EnumerateUser(user model.UserID) []model.CircuitListing {
	// Enumerate all versions sequentially
	ids_v0, circuits_v0, err := ds.v0().EnumerateCircuits(string(user))
	if err != nil {
		panic(err)
	}
	ids_v0_1, mds_v0_1, err := ds.v0_1().EnumerateUser(string(user))
	if err != nil {
		panic(err)
	}

	// Convert all older circuits to newest version before creating listings
	listings := make(map[model.CircuitID]model.CircuitListing)
	for j, id := range ids_v0 {
		cid := model.CircuitID(id)
		listings[cid] = v0_1_ToListing(v0_1.Migrate(circuits_v0[j]).Circuit, cid)
	}
	for j, id := range ids_v0_1 {
		cid := model.CircuitID(id)
		listings[cid] = v0_1_ToListing(mds_v0_1[j], cid)
	}

	res := make([]model.CircuitListing, len(listings))
	i := 0
	for _, v := range listings {
		res[i] = v
		i += 1
	}
	return res
}

func (ds DatastoreDB) LoadCircuit(id model.CircuitID) (model.Circuit, bool) {
	circuit, contentChunks, err := ds.v0_1().LoadCircuit(v0_1.DBCircuitID(id))
	if err == datastore.ErrNoSuchEntity {
		return model.Circuit{}, false
	} else if err != nil {
		panic(err)
	}
	return v0_1_ToCircuit(circuit, contentChunks), true
}

func (ds DatastoreDB) InsertCircuit(c model.Circuit, perms model.CircuitPermissions) model.CircuitID {
	db := ds.v0_1()
	dbCirc, dbChunks := v0_1_FromCircuit(c)
	id, permsID, err := db.InsertCircuit(v0_1.FullCircuit{
		Circuit:     dbCirc,
		Permissions: v0_1_FromPerms(perms),
		Content:     dbChunks,
	})
	if err != nil {
		panic(err)
	}
	ds.keys[id] = permsID
	return model.CircuitID(id)
}

func (ds DatastoreDB) UpdateCircuit(id model.CircuitID, c model.Circuit) {
	dbCirc, dbChunks := v0_1_FromCircuit(c)
	err := ds.v0_1().UpdateCircuit(v0_1.DBCircuitID(id), dbCirc, dbChunks)
	if err != nil {
		panic(err)
	}
}

func (ds DatastoreDB) DeleteCircuit(id model.CircuitID) {
	// Try to delete from all versions, since migration may not have happened yet.
	// In practice, "LoadPermissions" would have been called to authorize a Delete
	// request, so deleting the v0 circuit is mostly unnecessary.
	err := ds.v0().DeleteCircuit(v0.DBCircuitID(id))
	if err != nil {
		panic(err)
	}
	err = ds.v0_1().DeleteCircuit(v0_1.DBCircuitID(id))
	if err != nil {
		panic(err)
	}
}

func (ds DatastoreDB) loadPermLatest(id v0_1.DBCircuitID) (model.CircuitPermissions, error) {
	// Fast path: Load from latest DB version
	permsID, perms, err := ds.v0_1().LoadPermissions(id)
	if err != nil {
		return model.CircuitPermissions{}, err
	}
	ds.keys[id] = permsID
	return v0_1_ToPerms(perms), nil
}

func (ds DatastoreDB) tryMigrate(id model.CircuitID) (bool, error) {
	// NOTE: transaction is only OK because the previous implicity 1MB limit is
	// within the 10MB transaction limit.  Future migrations will need to change this.
	_, err := ds.Client.RunInTransaction(ds.Ctx, func(tx *datastore.Transaction) error {
		// The v0 key format is just a b16-encoded string, so the same ID numbers can be used for v0_1
		// Load old version
		v0_circuit, err := v0.LoadCircuitInTx(tx, v0.DBCircuitID(id))
		if err != nil {
			return err
		}

		// Migrate circuit
		circuit := v0_1.Migrate(v0_circuit)

		// Insert metadata
		err = v0_1.InsertCircuitInTx(tx, v0_1.DBCircuitID(id), circuit.Circuit, circuit.Permissions, circuit.Content[0])
		if err != nil {
			return err
		}

		// Exclude circuit from future queries
		return v0.HideCircuitInTx(tx, v0.DBCircuitID(id), v0_circuit)
	})
	if err == datastore.ErrNoSuchEntity {
		return false, nil
	}
	return err == nil, err
}

func (ds DatastoreDB) LoadPermissions(id model.CircuitID) (model.CircuitPermissions, bool) {
	// Short-circuit.  id 0 is the "Incomplete" ID
	if id == 0 {
		return model.CircuitPermissions{}, false
	}

	dbID := v0_1.DBCircuitID(id)
	perms, err := ds.loadPermLatest(dbID)
	if err == nil {
		return perms, true
	} else if err != datastore.ErrNoSuchEntity {
		panic(err)
	}

	// migration case
	m, err := ds.tryMigrate(id)
	if err != nil {
		panic(err)
	}
	if m {
		// migration complete.  Try again
		perms, err = ds.loadPermLatest(dbID)
		if err == nil {
			return perms, true
		} else if err != datastore.ErrNoSuchEntity {
			panic(err)
		}
	}

	// This may sometimes return 404 during a migration
	return model.CircuitPermissions{}, false
}

func (ds DatastoreDB) UpdatePermissions(id model.CircuitID, perms model.CircuitPermissions) {
	dbID := v0_1.DBCircuitID(id)
	permID := ds.getPermID(dbID)
	err := ds.v0_1().UpdatePermissions(dbID, permID, v0_1_FromPerms(perms))
	if err != nil {
		panic(err)
	}
}

func (d DatastoreDB) Close() {
	if err := d.Client.Close(); err != nil {
		panic(err)
	}
}
