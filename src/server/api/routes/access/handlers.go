package access

import (
	"errors"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type AccessHandler = func(_ *api.Context, _ model.UserPermission) (int, interface{})

func Wrapper(f AccessHandler) api.HandlerFunc {
	return func(c *api.Context) (int, interface{}) {
		userId := c.Identity()

		// Get the requester's permission level
		requesterPerms, err := c.Access.GetCircuitUser(c.Param("cid"), userId)
		if err != nil {
			return http.StatusInternalServerError, nil
		}
		if requesterPerms.Invalid() {
			return http.StatusNotFound, nil
		}
		return f(c, requesterPerms)
	}
}

func GetCircuit(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	if !requesterPerms.CanEnumeratePerms() {
		return http.StatusForbidden, nil
	}

	perms, err := c.Access.GetCircuit(requesterPerms.CircuitId)
	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusOK, perms
}

func UpsertCircuitUser(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var proposedPerms model.UserPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	currentPerms, err := c.Access.GetCircuitUser(requesterPerms.CircuitId, proposedPerms.UserId)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	// TODO: Missing check for low priviledge user demoting higher one
	if !requesterPerms.CanUpdateUser(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitId = requesterPerms.CircuitId
	err = c.Access.UpsertCircuitUser(proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}

func UpsertCircuitLink(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var proposedPerms model.LinkPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	currentPerms, err := c.Access.GetLink(proposedPerms.LinkId)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if !requesterPerms.CanUpdateLink(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitId = requesterPerms.CircuitId
	resultPerms, err := c.Access.UpsertCircuitLink(proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, resultPerms
}

func DeleteCircuitUser(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	uid := c.Param("uid")
	revokedPerm, err := c.Access.GetCircuitUser(requesterPerms.CircuitId, uid)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if revokedPerm.Invalid() {
		return http.StatusNotFound, nil
	}

	if !requesterPerms.CanRevokeUser(revokedPerm) {
		return http.StatusForbidden, nil
	}

	err = c.Access.DeleteCircuitUser(requesterPerms.CircuitId, revokedPerm.UserId)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}

func DeleteCircuitLink(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	lid := c.Param("lid")
	linkPerms, err := c.Access.GetLink(lid)
	if err != nil {
		return http.StatusBadRequest, err
	}
	if linkPerms.Invalid() {
		return http.StatusNotFound, nil
	}
	if linkPerms.CircuitId != requesterPerms.CircuitId {
		return http.StatusBadRequest, errors.New("link id does not match circuit id")
	}

	if !requesterPerms.CanRevokeLink(linkPerms) {
		return http.StatusForbidden, nil
	}

	err = c.Access.DeleteLink(lid)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}
