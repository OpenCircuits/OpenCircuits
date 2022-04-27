package gcp_datastore

import (
	"context"
	"errors"
	"os"

	"cloud.google.com/go/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"google.golang.org/api/option"
)

// A flat data structure to load data to/from
type datastoreCircuit struct {
	ID              string // TODO: Can this get the real circuit id type?
	Name            string
	Owner           string
	Desc            string
	Thumbnail       string `datastore:",noindex"`
	Version         string
	CircuitDesigner string `datastore:",noindex"`
}

func (dCircuit datastoreCircuit) toCircuit() model.Circuit {
	c := model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      dCircuit.Name,
			Owner:     model.UserID(dCircuit.Owner),
			Desc:      dCircuit.Desc,
			Thumbnail: dCircuit.Thumbnail,
			Version:   dCircuit.Version,
		},
		Designer: dCircuit.CircuitDesigner,
	}
	c.Metadata.ID.Base64Decode(dCircuit.ID)
	return c
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
type circuitDriver struct {
	dsClient *datastore.Client
	ctx      context.Context
}

func NewCircuitDriver(ctx context.Context, ops ...option.ClientOption) (model.CircuitDriver, error) {
	projectId := os.Getenv("DATASTORE_PROJECT_ID")
	if projectId == "" {
		return nil, errors.New("DATASTORE_PROJECT_ID environment variable must be set")
	}
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &circuitDriver{dsClient: ds, ctx: ctx}, nil
}

// Creates a new GCP datastore instance for use with the local datastore emulator
func NewCircuitEmuDriver(ctx context.Context, projectId string, emuHost string, ops ...option.ClientOption) (model.CircuitDriver, error) {
	_ = os.Setenv("DATASTORE_EMULATOR_HOST", emuHost)
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &circuitDriver{dsClient: ds, ctx: ctx}, nil
}

func (d *circuitDriver) LoadCircuit(circuitID model.CircuitID) *model.Circuit {
	key := datastore.NameKey("Circuit", circuitID.Base64Encode(), nil)
	dCircuit := &datastoreCircuit{}
	if err := d.dsClient.Get(d.ctx, key, dCircuit); err != nil {
		return nil
	}
	c := dCircuit.toCircuit()
	return &c
}

// // TODO: Move this to a proper migration
// circuitID := model.NewCircuitID()
// newKey := datastore.NameKey("Circuit", circuitID.Base64Encode(), nil)
// x.ID = circuitID.Base64Encode()
// tx, err := d.dsClient.NewTransaction(d.ctx)
// if err != nil {
// 	panic(err)
// }
// if err := tx.Delete(key); err != nil {
// 	panic(err)
// }
// if _, err := tx.Put(newKey, &x); err != nil {
// 	panic(err)
// }
// if _, err := tx.Commit(); err != nil {
// 	panic(err)
// }

func (d *circuitDriver) LoadMetadata(ids []model.CircuitID) []model.CircuitMetadata {
	var keys []*datastore.Key
	for _, id := range ids {
		keys = append(keys, datastore.NameKey("Circuit", id.Base64Encode(), nil))
	}
	var circuits []datastoreCircuit
	if err := d.dsClient.GetMulti(d.ctx, keys, &circuits); err != nil {
		panic(err)
	}

	var metadata []model.CircuitMetadata
	for _, c := range circuits {
		metadata = append(metadata, c.toCircuit().Metadata)
	}
	return metadata
}

func (d *circuitDriver) UpsertCircuit(c model.Circuit) {
	key, dCircuit := fromCircuit(c)
	if _, err := d.dsClient.Put(d.ctx, key, &dCircuit); err != nil {
		panic(err)
	}
}

func (d circuitDriver) DeleteCircuit(circuitID model.CircuitID) {

	if err := d.dsClient.Delete(d.ctx, datastore.NameKey("Circuit", circuitID.Base64Encode(), nil)); err != nil {
		panic(err)
	}
}

func (d *circuitDriver) Close() {
	if err := d.dsClient.Close(); err != nil {
		panic(err)
	}
}
