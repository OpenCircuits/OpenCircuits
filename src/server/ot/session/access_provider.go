package session

import (
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type AccessProvider interface {
	Permissions() model.BasePermission
}

type LinkAccessProvider struct {
	AccessDriver interfaces.AccessDriver
	LinkID       model.LinkID
}

func (ap LinkAccessProvider) Permissions() model.BasePermission {
	perm, err := ap.AccessDriver.GetLink(ap.LinkID)
	return permHelper(perm.BasePermission, err)
}

type UserAccessProvider struct {
	AccessDriver interfaces.AccessDriver
	UserID       model.UserID
	CircuitID    model.CircuitID
}

func (ap UserAccessProvider) Permissions() model.BasePermission {
	perm, err := ap.AccessDriver.GetCircuitUser(ap.CircuitID, ap.UserID)
	return permHelper(perm.BasePermission, err)
}

func permHelper(perm model.BasePermission, err error) model.BasePermission {
	if err != nil {
		log.Printf("error fetching permissions for session: %v\n", err)
		return model.BasePermission{}
	}
	return perm
}
