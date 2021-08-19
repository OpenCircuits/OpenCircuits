package model

import (
	"testing"
	"time"
)

func userPerm(level int32) UserPermission {
	return UserPermission{
		"FakeUser",
		"FakeCircuit",
		BasePermission{level, time.Time{}},
	}
}

func linkPerm(level int32) LinkPermission {
	return LinkPermission{
		"FakeLink",
		"FakeCircuit",
		BasePermission{level, time.Time{}},
	}
}

func none() UserPermission {
	return userPerm(AccessNone)
}

// TestUserNoAccess makes sure the "no access" user permission indeed has no access
func TestUserNoAccess(t *testing.T) {
	for i := int32(0); i <= AccessCreater; i += 10 {
		for j := int32(0); j <= AccessCreater; j += 10 {
			if none().CanUpdateUser(userPerm(i), userPerm(j)) {
				t.Error("\"no access\" user could change user perms")
			}
			if none().CanUpdateLink(linkPerm(i), linkPerm(j)) {
				t.Error("\"no access\" user could change link perms")
			}
		}
	}
}
