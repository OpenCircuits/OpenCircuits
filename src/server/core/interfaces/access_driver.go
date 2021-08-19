package interfaces

import "github.com/OpenCircuits/OpenCircuits/site/go/core/model"

// All errors indicate internal errors
type AccessDriver interface {
	// Gets the permissions for the given circuit id
	GetCircuit(circuitId model.CircuitId) (model.CircuitPermissions, error)
	// Gets the permissions for the given circuit id and user id
	GetCircuitUser(circuitId model.CircuitId, userId model.UserId) (model.UserPermission, error)
	// Gets the permissions for the link id
	GetLink(linkId model.LinkId) (model.LinkPermission, error)
	GetUser(userId model.UserId) (model.AllUserPermissions, error)

	// Upserts all the circuit permissions
	// UpsertCircuit(perms CircuitPermissions) error
	// Upserts permissions for a single user/circuit
	UpsertCircuitUser(perm model.UserPermission) error
	// Upserts permissions for a link Id.  Link Id is created and returned if not provided
	UpsertCircuitLink(perm model.LinkPermission) (model.LinkPermission, error)

	// Deletes all permissions for a circuit
	DeleteCircuit(circuitId model.CircuitId) error
	// Deletes permissions for a given user and circuit
	DeleteCircuitUser(circuitId model.CircuitId, userId model.UserId) error
	// Deletes permissions for a given link
	DeleteLink(linkId model.LinkId) error
}
