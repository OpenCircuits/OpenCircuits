package access

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// All errors indicate internal errors
type DataDriver interface {
	// Gets the permissions for the given circuit id
	GetCircuit(circuitId model.CircuitId) (*CircuitPermissions, error)
	// Gets the permissions for the given circuit id and user id.  Returns nil
	//	if the circuit Id is not found
	GetCircuitUser(circuitId model.CircuitId, userId model.UserId) (*UserPermission, error)
	// Gets the permissions for the link id
	GetLink(linkId LinkId) (*LinkPermission, error)

	// Upserts all the circuit permissions
	// UpsertCircuit(perms CircuitPermissions) error
	// Upserts permissions for a single user/circuit
	UpsertCircuitUser(perm UserPermission) error
	// Upserts permissions for a link Id.  Link Id is created and returned if not provided
	UpsertCircuitLink(perm LinkPermission) (LinkPermission, error)

	// Deletes all permissions for a circuit
	// DeleteCircuit(circuitId model.CircuitId) error
	// Deletes permissions for a given user and circuit
	DeleteCircuitUser(circuitId model.CircuitId, userId model.UserId) error
	// Deletes permissions for a given link
	DeleteLink(linkId LinkId) error
}
