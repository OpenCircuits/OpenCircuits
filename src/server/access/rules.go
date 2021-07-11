package access

import "github.com/OpenCircuits/OpenCircuits/site/go/auth"

func (user UserPermission) IsAnonymous() bool {
	return user.UserId == auth.AnonUserID
}

func (user UserPermission) CanExtendUser(target UserPermission) bool {
	// TODO: Use date
	return target.AccessLevel <= user.AccessLevel
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

func (user UserPermission) CanEdit() bool {
	// TODO: Use date
	return user.AccessLevel >= AccessEdit
}

func (user UserPermission) CanDeleteCircuit() bool {
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
