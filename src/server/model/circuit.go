package model

// CircuitDBFactory creates CircuitDB instances to help manage transient state.
type CircuitDBFactory interface {
	Create() CircuitDB
}

// CircuitDB represents an interface to a circuit storage system.
type CircuitDB interface {
	// Tries to load a circuit with a given ID
	LoadCircuit(id CircuitID) (Circuit, bool)
	// Creates / Updates a circuit, returning updated metadata
	InsertCircuit(circuit Circuit, perms CircuitPermissions) CircuitID
	// Updates a circuit
	UpdateCircuit(id CircuitID, circuit Circuit)
	// Deletes a circuit by ID
	DeleteCircuit(id CircuitID)

	// Load circuit permission data for a given ID
	LoadPermissions(id CircuitID) (CircuitPermissions, bool)
	// Update circuit permission data
	UpdatePermissions(id CircuitID, perms CircuitPermissions)

	// Loads metadata for all circuits for a given user
	EnumerateUser(user UserID) []CircuitListing
}

// Limits
const (
	NameSizeLimit      = 256
	DescSizeLimit      = 1400
	ThumbnailSizeLimit = 256*256*4 + 2*1024
	VersionSizeLimit   = 32
	ContentSizeLimit   = 30 * 1023 * 1024
)

type CircuitListing struct {
	ID        CircuitID     `json:"id"`
	Name      string        `json:"name"`
	Desc      string        `json:"desc"`
	Version   SchemaVersion `json:"version"`
	Thumbnail string        `json:"thumbnail"`
}

type CircuitMetadata struct {
	Name      string        `json:"name"`
	Desc      string        `json:"desc"`
	Version   SchemaVersion `json:"version"`
	Thumbnail string        `json:"thumbnail"`
}

type Circuit struct {
	Metadata CircuitMetadata `json:"metadata"`
	Content  string          `json:"contents"`
}
