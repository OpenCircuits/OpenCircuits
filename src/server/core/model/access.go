package model

// Use signed int so negative overflow bugs cant't elevate perms
type AccessLevel = int32

const (
	AccessNone    = 0
	AccessView    = 10
	AccessEdit    = 20
	AccessOwner   = 30
	AccessCreater = 40
)

// BasePermission describes permission level independent of type
type BasePermission struct {
	AccessLevel AccessLevel `json:"access_level" binding:"required"`
	// Expiration is the unix time that the permissions should expire
	Expiration int64 `json:"expiration" binding:"required"`
}

// UserPermission describes the permission for a single user / circuit
type UserPermission struct {
	CircuitId CircuitId `json:"circuit_id" binding:"required"`
	UserId    UserId    `json:"user_id" binding:"required"`
	BasePermission
}

// Permissions for all users of a circuit
type UserPermissions = map[UserId]UserPermission

// Permissions for all circuits of a user
type AllUserPermissions = map[CircuitId]UserPermission

type LinkId = CircuitId

// LinkPermission describes the permission level and circuit binding for a share link
type LinkPermission struct {
	CircuitId CircuitId `json:"circuit_id" binding:"required"`
	LinkId    LinkId    `json:"link_id"`
	BasePermission
}
type LinkPermissions = map[LinkId]LinkPermission

// CircuitPermissions describes all sharing permissions of a circuit
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

func (b BasePermission) Invalid() bool {
	return b.Expiration == 0
}

func (user UserPermission) IsAnonymous() bool {
	return user.UserId == AnonUserID
}

func (user UserPermission) CanUpdateUser(oldTarget, newTarget UserPermission) bool {
	// TODO: Use date
	canPromote := newTarget.AccessLevel <= user.AccessLevel &&
		newTarget.AccessLevel < AccessCreater
	canDemote := oldTarget.AccessLevel < user.AccessLevel
	return canPromote && canDemote
}

// The maximum permission level that can be extended via links
func MaxLinkPerm() AccessLevel {
	return AccessEdit
}

func (user BasePermission) CanUpdateLink(oldTarget, newTarget LinkPermission) bool {
	if newTarget.AccessLevel > MaxLinkPerm() {
		return false
	}
	// TODO: Use date
	return user.AccessLevel >= AccessOwner
}

func (user UserPermission) CanCreate() bool {
	return !user.IsAnonymous() && user.UserId != ""
}

func (user BasePermission) CanView() bool {
	// TODO: Use date
	return user.AccessLevel >= AccessView
}

func (user BasePermission) CanEdit() bool {
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
