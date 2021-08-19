package interfaces

import "github.com/OpenCircuits/OpenCircuits/site/go/core/model"

// All errors indicate internal errors
type AccessDriver interface {
	// Gets the permissions for the given circuit id
	GetCircuit(circuitID model.CircuitID) (model.CircuitPermissions, error)
	// Gets the permissions for the given circuit id and user id
	GetCircuitUser(circuitID model.CircuitID, userID model.UserID) (model.UserPermission, error)
	// Gets the permissions for the link id
	GetLink(linkID model.LinkID) (model.LinkPermission, error)
	GetUser(userID model.UserID) (model.AllUserPermissions, error)

	// Upserts all the circuit permissions
	// UpsertCircuit(perms CircuitPermissions) error
	// Upserts permissions for a single user/circuit
	UpsertCircuitUser(perm model.UserPermission) error
	// Upserts permissions for a link Id.  Link Id is created and returned if not provided
	UpsertCircuitLink(perm model.LinkPermission) (model.LinkPermission, error)

	// Deletes all permissions for a circuit
	DeleteCircuit(circuitID model.CircuitID) error
	// Deletes permissions for a given user and circuit
	DeleteCircuitUser(circuitID model.CircuitID, userID model.UserID) error
	// Deletes permissions for a given link
	DeleteLink(linkID model.LinkID) error
}
