package model

import (
	"time"
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
	CircuitId   CircuitId   `json:"circuit_id" binding:"required"`
	UserId      UserId      `json:"user_id" binding:"required"`
	AccessLevel AccessLevel `json:"access_level" binding:"required"`
	// TODO: Make required
	Expiration time.Time `json:"expiration"`
}

// Permissions for all users of a circuit
type UserPermissions = map[UserId]UserPermission

// Permissions for all circuits of a user
type AllUserPermissions = map[CircuitId]UserPermission

type LinkId = CircuitId

// Permission data for link-based sharing
type LinkPermission struct {
	CircuitId   CircuitId   `json:"circuit_id" binding:"required"`
	LinkId      LinkId      `json:"link_id"`
	AccessLevel AccessLevel `json:"access_level" binding:"required"`
	Expiration  time.Time   `json:"expiration" binding:"required"`
}
type LinkPermissions = map[LinkId]LinkPermission

// All permission data for a circuit
type CircuitPermissions struct {
	CircuitId CircuitId       `json:"circuit_id" binding:"required"`
	UserPerms UserPermissions `json:"user_perms" binding:"required"`
	LinkPerms LinkPermissions `json:"link_perms" binding:"required"`
	// Public    bool
}

func NewCircuitPerm(circuitId CircuitId) CircuitPermissions {
	return CircuitPermissions{
		CircuitId: circuitId,
		UserPerms: make(UserPermissions),
		LinkPerms: make(LinkPermissions),
	}
}

func (user UserPermission) IsAnonymous() bool {
	return user.UserId == AnonUserID
}

func (user UserPermission) CanExtendUser(target UserPermission) bool {
	// TODO: Use date
	return target.AccessLevel <= user.AccessLevel &&
		target.AccessLevel < AccessCreater
}

// The maximum permission level that can be extended via links
func MaxLinkPerm() AccessLevel {
	return AccessEdit
}

func (user UserPermission) CanExtendLink(target LinkPermission) bool {
	if target.AccessLevel > MaxLinkPerm() {
		return false
	}
	// TODO: Use date
	return user.AccessLevel >= AccessOwner
}

func (user UserPermission) CanCreate() bool {
	return !user.IsAnonymous() && user.UserId != ""
}

func (user UserPermission) CanView() bool {
	// TODO: Use date
	return user.AccessLevel >= AccessView
}

func (user UserPermission) CanEdit() bool {
	// TODO: Use date
	return user.AccessLevel >= AccessEdit
}

func (user UserPermission) CanDelete() bool {
	// TODO: Use date
	return user.AccessLevel >= AccessCreater
}

func (user UserPermission) CanRevokeUser(target UserPermission) bool {
	// TODO: Use date
	return user.AccessLevel >= target.AccessLevel &&
		user.AccessLevel >= AccessOwner
}

func (user UserPermission) CanRevokeLink(_ LinkPermission) bool {
	// TODO: Use date
	return user.AccessLevel >= AccessOwner
}

func (user UserPermission) CanEnumeratePerms() bool {
	// TODO: Use date
	return user.AccessLevel >= AccessOwner
}
