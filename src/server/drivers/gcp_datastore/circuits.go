package gcp_datastore

import (
	"context"
	"errors"
	"os"

	"cloud.google.com/go/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

// A flat data structure to load data to/from
type datastoreCircuit struct {
	ID              string
	Name            string
	Owner           string
	Desc            string
	Thumbnail       string `datastore:",noindex"`
	Version         string
	CircuitDesigner string `datastore:",noindex"`
}

func (dCircuit datastoreCircuit) toCircuit(id model.CircuitID) model.Circuit {
	return model.Circuit{
		Metadata: model.OldCircuitMetadata{
			ID:        id,
			Name:      dCircuit.Name,
			Owner:     model.UserID(dCircuit.Owner),
			Desc:      dCircuit.Desc,
			Thumbnail: dCircuit.Thumbnail,
			Version:   dCircuit.Version,
		},
		Designer: dCircuit.CircuitDesigner,
	}
}

func fromCircuit(c model.Circuit) (*datastore.Key, datastoreCircuit) {
	circuitID := c.Metadata.ID.Base64Encode()
	return datastore.NameKey("Circuit", circuitID, nil),
		datastoreCircuit{
			ID:              circuitID,
			Name:            c.Metadata.Name,
			Owner:           string(c.Metadata.Owner),
			Desc:            c.Metadata.Desc,
			Thumbnail:       c.Metadata.Thumbnail,
			Version:         c.Metadata.Version,
			CircuitDesigner: c.Designer,
		}
}

// A GCP cloud datastore interface provider that assumes the GCP DS state is valid for the current version of the
//	application; Migrations may be required and a new "version" field may need to be added
type datastoreStorageInterface struct {
	dsClient *datastore.Client
	ctx      context.Context
}

func NewInterfaceFactory(ctx context.Context, ops ...option.ClientOption) (model.CircuitStorageInterfaceFactory, error) {
	projectId := os.Getenv("DATASTORE_PROJECT_ID")
	if projectId == "" {
		return nil, errors.New("DATASTORE_PROJECT_ID environment variable must be set")
	}
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &datastoreStorageInterface{dsClient: ds, ctx: ctx}, nil
}

// Creates a new GCP datastore instance for use with the local datastore emulator
func NewEmuInterfaceFactory(ctx context.Context, projectId string, emuHost string, ops ...option.ClientOption) (model.CircuitStorageInterfaceFactory, error) {
	_ = os.Setenv("DATASTORE_EMULATOR_HOST", emuHost)
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &datastoreStorageInterface{dsClient: ds, ctx: ctx}, nil
}

func (d *datastoreStorageInterface) CreateCircuitStorageInterface() model.CircuitStorageInterface {
	return d
}

func (d *datastoreStorageInterface) LoadCircuit(circuitID model.CircuitID) *model.Circuit {
	key := datastore.NameKey("Circuit", circuitID.Base64Encode(), nil)
	dCircuit := &datastoreCircuit{}
	if err := d.dsClient.Get(d.ctx, key, dCircuit); err != nil {
		return nil
	}
	c := dCircuit.toCircuit(circuitID)
	return &c
}

func (d *datastoreStorageInterface) EnumerateCircuits(userID model.UserID) []model.OldCircuitMetadata {
	query := datastore.NewQuery("Circuit").
		Filter("Owner =", string(userID))
	it := d.dsClient.Run(d.ctx, query)
	var metadatas []model.OldCircuitMetadata
	for {
		var x datastoreCircuit
		key, err := it.Next(&x)
		if err == iterator.Done {
			break
		}
		if err != nil {
			panic(err)
		}

		var circuitID model.CircuitID
		if circuitID.Base64Decode(key.Name) != nil {
			panic("Failed to parse circuit ID from GCP datastore")
		}
		metadatas = append(metadatas, x.toCircuit(circuitID).Metadata)
	}
	return metadatas
}

func (d *datastoreStorageInterface) UpdateCircuit(c model.Circuit) {
	key, dCircuit := fromCircuit(c)
	_, err := d.dsClient.Put(d.ctx, key, &dCircuit)
	if err != nil {
		panic(err)
	}
}

func (d *datastoreStorageInterface) NewCircuit() model.Circuit {
	// NOTE: If the user loads their list of circuits in between the `NewCircuit` and
	//		 the `UpdateCircuit` call, they will see an empty listing.  In practice
	//		 this should not happen very often, but could be avoided by merging
	//		 the `Update` and `Create` actions into one and perform a transaction.
	circuitID := model.NewCircuitID()
	key := datastore.NameKey("Circuit", circuitID.Base64Encode(), nil)
	dCircuit := datastoreCircuit{}
	nk, err := d.dsClient.Put(d.ctx, key, &dCircuit)
	if err != nil {
		panic(err)
	}
	print(nk)

	circuit := model.Circuit{}
	circuit.Metadata.ID = circuitID
	return circuit
}

func (d datastoreStorageInterface) DeleteCircuit(circuitID model.CircuitID) {
	err := d.dsClient.Delete(d.ctx, datastore.NameKey("Circuit", circuitID.Base64Encode(), nil))
	if err != nil {
		panic(err)
	}
}

func (d *datastoreStorageInterface) Close() {
	if err := d.dsClient.Close(); err != nil {
		panic(err)
	}
}
