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
	CircuitId   model.CircuitId `json:"circuit_id"`
	UserId      model.UserId    `json:"user_id"`
	AccessLevel AccessLevel     `json:"access_level"`
	Expiration  time.Time       `json:"expiration"`
}
type UserPermissions = map[model.UserId]UserPermission

type LinkId = model.CircuitId

// Permission data for link-based sharing
type LinkPermission struct {
	CircuitId   model.CircuitId `json:"circuit_id"`
	LinkId      LinkId          `json:"link_id"`
	AccessLevel AccessLevel     `json:"access_level"`
	Expiration  time.Time       `json:"expiration"`
}
type LinkPermissions = map[LinkId]LinkPermission

// All permission data for a circuit
type CircuitPermissions struct {
	CircuitId model.CircuitId `json:"circuit_id"`
	UserPerms UserPermissions `json:"user_perms"`
	LinkPerms LinkPermissions `json:"link_perms"`
	// Public    bool
}

func NewCircuitPerm(circuitId model.CircuitId) CircuitPermissions {
	return CircuitPermissions{
		CircuitId: circuitId,
		UserPerms: make(UserPermissions),
		LinkPerms: make(LinkPermissions),
	}
}
