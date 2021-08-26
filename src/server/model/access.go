package model

type AccessDriver interface {
	// GetCircuit gets the permissions for the given circuit id
	GetCircuit(circuitID CircuitID) (CircuitPermissions, bool)
	// GetCircuitUser gets the permissions for the given circuit id and user id
	GetCircuitUser(circuitID CircuitID, userID UserID) (UserPermission, bool)
	// GetLink gets the permissions for the link id
	GetLink(linkID LinkID) (LinkPermission, bool)
	// GetUser gets all permissions for a user
	GetUser(userID UserID) AllUserPermissions

	// Upserts all the circuit permissions
	// UpsertCircuit(perms CircuitPermissions) error
	// UpsertCircuitUser upserts permissions for a single user/circuit
	UpsertCircuitUser(perm UserPermission)
	// UpsertCircuitLink upserts permissions for a link Id.  Link Id is created and returned if not provided
	UpsertCircuitLink(perm LinkPermission) LinkPermission

	// DeleteCircuit deletes all permissions for a circuit
	DeleteCircuit(circuitID CircuitID)
	// DeleteCircuitUser deletes permissions for a given user and circuit
	DeleteCircuitUser(circuitID CircuitID, userID UserID)
	// DeleteLink deletes permissions for a given link
	DeleteLink(linkID LinkID)
}

type AccessProvider interface {
	Permissions() BasePermission
}

// Use signed int so negative overflow bugs cant't elevate perms
type AccessLevel = int32

const (
	AccessNone    = 0
	AccessView    = 10
	AccessEdit    = 20
	AccessOwner   = 30
	AccessCreator = 40
)

// BasePermission describes permission level independent of type
type BasePermission struct {
	AccessLevel AccessLevel `json:"access_level" binding:"required"`
	// Expiration is the unix time that the permissions should expire
	Expiration *int64 `json:"expiration,omitempty"`
}

// UserPermission describes the permission for a single user / circuit
type UserPermission struct {
	CircuitID CircuitID `json:"circuit_id" binding:"required"`
	UserID    UserID    `json:"user_id" binding:"required"`
	BasePermission
}

// Permissions for all users of a circuit
type UserPermissions = map[UserID]UserPermission

// Permissions for all circuits of a user
type AllUserPermissions = map[CircuitID]UserPermission

// LinkPermission describes the permission level and circuit binding for a share link
type LinkPermission struct {
	CircuitID CircuitID `json:"circuit_id" binding:"required"`
	LinkID    LinkID    `json:"link_id"`
	BasePermission
}
type LinkPermissions = map[LinkID]LinkPermission

// CircuitPermissions describes all sharing permissions of a circuit
type CircuitPermissions struct {
	CircuitID CircuitID       `json:"circuit_id" binding:"required"`
	UserPerms UserPermissions `json:"user_perms" binding:"required"`
	LinkPerms LinkPermissions `json:"link_perms" binding:"required"`
	// Public    bool
}

func NewCircuitPerm(circuitID CircuitID) CircuitPermissions {
	return CircuitPermissions{
		CircuitID: circuitID,
		UserPerms: make(UserPermissions),
		LinkPerms: make(LinkPermissions),
	}
}

// AnonUserID is the user ID given to all anonymous users.
//	This may change
const AnonUserID = "ANON"

func IsAnonymous(userID UserID) bool {
	return userID == AnonUserID
}

func (user UserPermission) IsAnonymous() bool {
	return IsAnonymous(user.UserID)
}

func (user UserPermission) CanUpdateUser(oldTarget, newTarget UserPermission) bool {
	// TODO: Use date
	canPromote := newTarget.AccessLevel <= user.AccessLevel &&
		newTarget.AccessLevel < AccessCreator
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

func CanCreate(userID UserID) bool {
	return !IsAnonymous(userID) && userID != ""
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
	return user.AccessLevel >= AccessCreator
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

type LinkAccessProvider struct {
	AccessDriver AccessDriver
	LinkID       LinkID
}

func (ap LinkAccessProvider) Permissions() BasePermission {
	perm, _ := ap.AccessDriver.GetLink(ap.LinkID)
	return perm.BasePermission
}

type UserAccessProvider struct {
	AccessDriver AccessDriver
	UserID       UserID
	CircuitID    CircuitID
}

func (ap UserAccessProvider) Permissions() BasePermission {
	perm, _ := ap.AccessDriver.GetCircuitUser(ap.CircuitID, ap.UserID)
	return perm.BasePermission
}
