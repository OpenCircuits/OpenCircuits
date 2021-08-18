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
	LinkID       model.LinkId
}

func (ap LinkAccessProvider) Permissions() model.BasePermission {
	perm, err := ap.AccessDriver.GetLink(ap.LinkID)
	return permHelper(&perm.BasePermission, err)
}

type UserAccessProvider struct {
	AccessDriver interfaces.AccessDriver
	UserID       model.UserId
	CircuitID    model.CircuitId
}

func (ap UserAccessProvider) Permissions() model.BasePermission {
	perm, err := ap.AccessDriver.GetCircuitUser(ap.CircuitID, ap.UserID)
	return permHelper(&perm.BasePermission, err)
}

func permHelper(perm *model.BasePermission, err error) model.BasePermission {
	if err != nil {
		log.Printf("error fetching permissions for session: %v\n", err)
		return model.BasePermission{}
	} else if perm == nil {
		log.Println("link was revoked")
		return model.BasePermission{}
	}
	return *perm
}
