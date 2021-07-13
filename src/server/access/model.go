package access

import (
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// Use signed int so negative overflow bugs cant't elevate perms
type AccessLevel = int32

const (
	AccessNone    = 0
	AccessView    = 10
	AccessEdit    = 20
	AccessOwner   = 30
	AccessCreater = 40
)

// Permission data for a single circuit / user
type UserPermission struct {
	CircuitId   model.CircuitId `json:"circuit_id" binding:"required"`
	UserId      model.UserId    `json:"user_id" binding:"required"`
	AccessLevel AccessLevel     `json:"access_level" binding:"required"`
	// TODO: Make required
	Expiration time.Time `json:"expiration"`
}

// Permissions for all users of a circuit
type UserPermissions = map[model.UserId]UserPermission

// Permissions for all circuits of a user
type AllUserPermissions = map[model.CircuitId]UserPermission

type LinkId = model.CircuitId

// Permission data for link-based sharing
type LinkPermission struct {
	CircuitId   model.CircuitId `json:"circuit_id" binding:"required"`
	LinkId      LinkId          `json:"link_id"`
	AccessLevel AccessLevel     `json:"access_level" binding:"required"`
	Expiration  time.Time       `json:"expiration" binding:"required"`
}
type LinkPermissions = map[LinkId]LinkPermission

// All permission data for a circuit
type CircuitPermissions struct {
	CircuitId model.CircuitId `json:"circuit_id" binding:"required"`
	UserPerms UserPermissions `json:"user_perms" binding:"required"`
	LinkPerms LinkPermissions `json:"link_perms" binding:"required"`
	// Public    bool
}

func NewCircuitPerm(circuitId model.CircuitId) CircuitPermissions {
	return CircuitPermissions{
		CircuitId: circuitId,
		UserPerms: make(UserPermissions),
		LinkPerms: make(LinkPermissions),
	}
}
