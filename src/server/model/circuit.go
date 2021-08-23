package model

import "encoding/json"

// CircuitDriver provides access to circuit metadata and lifecycle
// TODO: how to handle delete?
type CircuitDriver interface {
	// Metadata fetches metadata for the provided circuit IDs
	LookupCircuits(circuitIDs []CircuitID) []CircuitMetadata
	// UpdateMetadata updates a circuit metadata
	UpdateMetadata(circuitID CircuitID, metadata ExplicitMetadata)
	// New makes a new circuit entry so that OT can be started
	NewCircuit(circuitID CircuitID, creator UserID)
}

// MilestoneDriver abstracts storage of milestone circuits
type MilestoneDriver interface {
	// AddMilestone adds a new milestone circuit to the database
	AddMilestone(milestone MilestoneCircuit)
	// DeleteMilestone deletes the milestone circuit with the given clock number if it exists
	DeleteMilestone(clock uint64)
	// Milestone returns the milestone circuit with the given clock number
	Milestone(clock uint64) (MilestoneCircuit, bool)
	// LatestMilestone returns the milestone circuit with the highest clock number
	LatestMilestone() (MilestoneCircuit, bool)
	// EnumerateMilestones returns metadata of all milestones
	EnumerateMilestones() []MilestoneCircuitMetadata
}

// MilestoneDriverFactory constructs MilestoneDrivers for circuit IDs
type MilestoneDriverFactory interface {
	NewMilestoneDriver(circuitID CircuitID) MilestoneDriver
}

// ExplicitMetadata is updated by the client, so fields are all optional
type ExplicitMetadata struct {
	Name      *string `json:"name,omitempty"`
	Desc      *string `json:"desc,omitempty"`
	Thumbnail *string `json:"thumbnail,omitempty"`
	// TODO: how to handle delete
	TrashUTC *int64 `json:"trash_utc,omitempty"`
}

// ImplicitMetadata is derived from the circuit state
type ImplicitMetadata struct {
	ID      CircuitID     `json:"id"`
	Creator UserID        `json:"creator"`
	Version SchemaVersion `json:"version"`
}

// CircuitMetadata is all metadata for a circuit, the result of a query operation
type CircuitMetadata struct {
	ImplicitMetadata
	ExplicitMetadata
}

// MilestoneCircuitMetadata is the metadata for a milestone circuit, potentially for auditing
type MilestoneCircuitMetadata struct {
	CircuitID CircuitID
	LogClock  uint64
	UserID    UserID
	Version   SchemaVersion
}

// MilestoneCircuit is a full circuit, including the log clock its content represents
type MilestoneCircuit struct {
	MilestoneCircuitMetadata
	Content json.RawMessage
}
