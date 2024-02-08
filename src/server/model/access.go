package model

import (
	"fmt"
)

// CircuitPermissions contains the access control parts of the circuit
type CircuitPermissions struct {
	Owner    UserID      `json:"owner"`
	LinkID   LinkID      `json:"link_id"`
	LinkPerm AccessLevel `json:"link_perm"`
}

func NewCircuitPermissions(owner UserID) CircuitPermissions {
	return CircuitPermissions{
		Owner:    owner,
		LinkID:   "",
		LinkPerm: AccessNone,
	}
}

// Use signed int so negative overflow bugs cant't elevate perms
type AccessLevel (int32)

const (
	AccessNone    = AccessLevel(0)
	AccessView    = AccessLevel(10)
	AccessEdit    = AccessLevel(20)
	AccessOwner   = AccessLevel(30)
	AccessCreator = AccessLevel(40)
)

func (u UserID) CanCreate() bool {
	return !u.IsAnonymous() && u != ""
}

func (lev AccessLevel) CanView() bool {
	return lev >= AccessView
}

func (lev AccessLevel) CanEdit() bool {
	return lev >= AccessEdit
}

func (lev AccessLevel) CanUpdatePerms() bool {
	return lev >= AccessOwner
}

func (lev AccessLevel) CanDelete() bool {
	return lev >= AccessCreator
}

var AccessMap = map[AccessLevel]string{
	AccessNone:    "none",
	AccessView:    "view",
	AccessEdit:    "edit",
	AccessOwner:   "owner",
	AccessCreator: "creator",
}
var AccessMapRev = map[string]AccessLevel{
	"none":    AccessNone,
	"view":    AccessView,
	"edit":    AccessEdit,
	"owner":   AccessOwner,
	"creator": AccessCreator,
}

func (lev AccessLevel) String() string {
	return AccessMap[lev]
}

func (lev *AccessLevel) MarshalText() ([]byte, error) {
	return []byte(lev.String()), nil
}

func (lev *AccessLevel) UnmarshalText(data []byte) error {
	str := string(data)
	if a, ok := AccessMapRev[str]; ok {
		*lev = a
		return nil
	} else {
		return fmt.Errorf("invalid access level \"%s\"", str)
	}
}
