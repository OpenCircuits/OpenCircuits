package v0_1

import (
	"encoding/base64"

	"cloud.google.com/go/datastore"
	"github.com/google/uuid"
)

// Version the top-level kind to make parallel loads/queries easier
const CircuitKind = "v0_1_Circuit"
const CircuitPermissionKind = "v0_1_CircuitPermission"
const CircuitContentHeaderKind = "v0_1_CircuitContentHeader"
const CircuitContentKind = "v0_1_CircuitContent"

// FullCircuit is the top-level model, rarely accessed in its entirety
type FullCircuit struct {
	Circuit     Circuit
	Permissions Permissions
	Content     []ContentChunk
}

// Circuit is the top-level fields in a Circuit entity
type Circuit struct {
	Name      string
	Desc      string
	Version   string
	Thumbnail string `datastore:",noindex"`
}

type Permissions struct {
	LinkID   string
	LinkPerm int
	Owner    string
}

const ContentChunkLimit = 1023 * 1024

// UUID string
type ContentID string

func NewContentID() ContentID {
	b, _ := uuid.New().MarshalBinary()
	return ContentID(base64.URLEncoding.EncodeToString(b))
}

// Content is a <1023KiB content entry
type ContentChunk struct {
	Seq       int
	ContentID ContentID
	Content   string `datastore:",noindex"`
}

func NewContentHeaderKey(circuitKey *datastore.Key) *datastore.Key {
	return datastore.NameKey(CircuitContentHeaderKind, "Content", circuitKey)
}

// ContentHeader is the authoratative source for which seqeuence of ContentChunk's is current
type ContentHeader struct {
	Clock     int64
	ContentID ContentID
}

type DBCircuitID int64

func (id DBCircuitID) toDSKey() *datastore.Key {
	return datastore.IDKey(CircuitKind, int64(id), nil)
}

type DBPermID int64

func (id DBPermID) toDSKey(circuitID DBCircuitID) *datastore.Key {
	return datastore.IDKey(CircuitPermissionKind, int64(id), circuitID.toDSKey())
}
