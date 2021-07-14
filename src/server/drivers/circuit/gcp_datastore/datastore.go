package gcp_datastore

import (
	"context"
	"errors"
	"os"
	"strconv"

	"cloud.google.com/go/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

// A flat data structure to load data to/from
type datastoreCircuit struct {
	ID              model.CircuitId
	Name            string
	Owner           model.UserId
	Desc            string
	Thumbnail       string `datastore:",noindex"`
	Version         string
	CircuitDesigner string `datastore:",noindex"`
}

func (dCircuit datastoreCircuit) toCircuit(id model.CircuitId) model.Circuit {
	return model.Circuit{
		Metadata: model.CircuitMetadata{
			ID:        id,
			Name:      dCircuit.Name,
			Owner:     dCircuit.Owner,
			Desc:      dCircuit.Desc,
			Thumbnail: dCircuit.Thumbnail,
			Version:   dCircuit.Version,
		},
		Designer: dCircuit.CircuitDesigner,
	}
}

func fromCircuit(c model.Circuit) (*datastore.Key, datastoreCircuit) {
	return datastore.NameKey("Circuit", c.Metadata.ID, nil),
		datastoreCircuit{
			ID:              c.Metadata.ID,
			Name:            c.Metadata.Name,
			Owner:           c.Metadata.Owner,
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

func NewInterfaceFactory(ctx context.Context, ops ...option.ClientOption) (interfaces.CircuitStorageInterfaceFactory, error) {
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
func NewEmuInterfaceFactory(ctx context.Context, projectId string, emuHost string, ops ...option.ClientOption) (interfaces.CircuitStorageInterfaceFactory, error) {
	_ = os.Setenv("DATASTORE_EMULATOR_HOST", emuHost)
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &datastoreStorageInterface{dsClient: ds, ctx: ctx}, nil
}

func (d *datastoreStorageInterface) CreateCircuitStorageInterface() interfaces.CircuitStorageInterface {
	return d
}

func (d *datastoreStorageInterface) LoadCircuit(id model.CircuitId) *model.Circuit {
	key := datastore.NameKey("Circuit", id, nil)
	dCircuit := &datastoreCircuit{}
	if err := d.dsClient.Get(d.ctx, key, dCircuit); err != nil {
		return nil
	}
	c := dCircuit.toCircuit(id)
	return &c
}

func (d *datastoreStorageInterface) EnumerateCircuits(userId model.UserId) []model.CircuitMetadata {
	query := datastore.NewQuery("Circuit").
		Filter("Owner =", userId)
	it := d.dsClient.Run(d.ctx, query)
	var metadatas []model.CircuitMetadata
	for {
		var x datastoreCircuit
		key, err := it.Next(&x)
		if err == iterator.Done {
			break
		}
		if err != nil {
			panic(err)
		}

		metadatas = append(metadatas, x.toCircuit(key.Name).Metadata)
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
	key := datastore.IncompleteKey("Circuit", nil)
	dCircuit := datastoreCircuit{}
	nk, err := d.dsClient.Put(d.ctx, key, &dCircuit)
	if err != nil {
		panic(err)
	}
	print(nk)

	circuit := model.Circuit{}
	circuit.Metadata.ID = strconv.FormatInt(nk.ID, 16)
	return circuit
}

func (d datastoreStorageInterface) DeleteCircuit(id model.CircuitId) {
	err := d.dsClient.Delete(d.ctx, datastore.NameKey("Circuit", id, nil))
	if err != nil {
		panic(err)
	}
}

func (d *datastoreStorageInterface) Close() {
	if err := d.dsClient.Close(); err != nil {
		panic(err)
	}
}
