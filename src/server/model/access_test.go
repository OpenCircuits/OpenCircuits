package model

import (
	"testing"
)

func userPerm(level int32) UserPermission {
	return UserPermission{
		CircuitID:      NewCircuitID(),
		UserID:         "FakeUser",
		BasePermission: BasePermission{level, nil},
	}
}

func linkPerm(level int32) LinkPermission {
	return LinkPermission{
		CircuitID:      NewCircuitID(),
		LinkID:         NewLinkID(),
		BasePermission: BasePermission{level, nil},
	}
}

func none() UserPermission {
	return userPerm(AccessNone)
}

func creater() UserPermission {
	return userPerm(AccessCreator)
}

// TestUserNoAccess makes sure the "no access" user permission indeed has no access
func TestUserNoAccess(t *testing.T) {
	for i := int32(0); i <= AccessCreator; i++ {
		for j := int32(0); j <= AccessCreator; j++ {
			if none().CanUpdateUser(userPerm(i), userPerm(j)) {
				t.Error("\"no access\" user could change user perms")
			}
			if none().CanUpdateLink(linkPerm(i), linkPerm(j)) {
				t.Error("\"no access\" user could change link perms")
			}
		}
	}
}

// TestDemoteCreater makes sure the "creater" user cannot be demoted
func TestDemoteCreater(t *testing.T) {
	for i := int32(0); i <= AccessCreator; i++ {
		for j := int32(0); j <= AccessCreator; j++ {
			if userPerm(i).CanUpdateUser(creater(), userPerm(j)) {
				t.Error("\"no access\" user could change user perms")
			}
		}
	}
}
