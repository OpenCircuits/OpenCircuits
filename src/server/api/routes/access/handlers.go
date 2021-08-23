package access

import (
	"errors"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type AccessHandler = func(_ *api.Context, _ model.UserPermission) (int, interface{})

func Wrapper(f AccessHandler) api.HandlerFunc {
	return func(c *api.Context) (int, interface{}) {
		userID := c.Identity()

		// Decode the circuit ID
		var circuitID model.CircuitID
		if circuitID.Base64Decode(c.Param("cid")) != nil {
			return http.StatusNotFound, nil
		}

		// Get the requester's permission level
		requesterPerms, ok := c.Access.GetCircuitUser(circuitID, userID)
		if !ok {
			return http.StatusNotFound, nil
		}
		return f(c, requesterPerms)
	}
}

func GetCircuit(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	if !requesterPerms.CanEnumeratePerms() {
		return http.StatusForbidden, nil
	}

	perms, _ := c.Access.GetCircuit(requesterPerms.CircuitID)
	return http.StatusOK, perms
}

func UpsertCircuitUser(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var proposedPerms model.UserPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	currentPerms, _ := c.Access.GetCircuitUser(requesterPerms.CircuitID, proposedPerms.UserID)

	if !requesterPerms.CanUpdateUser(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitID = requesterPerms.CircuitID
	c.Access.UpsertCircuitUser(proposedPerms)

	return http.StatusAccepted, nil
}

func UpsertCircuitLink(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var proposedPerms model.LinkPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	currentPerms, _ := c.Access.GetLink(proposedPerms.LinkID)
	if !requesterPerms.CanUpdateLink(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitID = requesterPerms.CircuitID
	resultPerms := c.Access.UpsertCircuitLink(proposedPerms)

	return http.StatusAccepted, resultPerms
}

func DeleteCircuitUser(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	userID := c.Param("uid")
	revokedPerm, ok := c.Access.GetCircuitUser(requesterPerms.CircuitID, model.UserID(userID))
	if !ok {
		return http.StatusNotFound, nil
	}

	if !requesterPerms.CanRevokeUser(revokedPerm) {
		return http.StatusForbidden, nil
	}

	c.Access.DeleteCircuitUser(requesterPerms.CircuitID, revokedPerm.UserID)

	return http.StatusAccepted, nil
}

func DeleteCircuitLink(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var linkID model.LinkID
	err := linkID.Base64Decode(c.Param("lid"))
	if err != nil {
		return http.StatusNotFound, nil
	}
	linkPerms, ok := c.Access.GetLink(linkID)
	if !ok {
		return http.StatusNotFound, nil
	}
	if linkPerms.CircuitID != requesterPerms.CircuitID {
		return http.StatusBadRequest, errors.New("link id does not match circuit id")
	}

	if !requesterPerms.CanRevokeLink(linkPerms) {
		return http.StatusForbidden, nil
	}

	c.Access.DeleteLink(linkID)

	return http.StatusAccepted, nil
}
