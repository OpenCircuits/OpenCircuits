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
		requesterPerms, err := c.Access.GetCircuitUser(circuitID, userID)
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

	perms, err := c.Access.GetCircuit(requesterPerms.CircuitID)
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

	currentPerms, err := c.Access.GetCircuitUser(requesterPerms.CircuitID, proposedPerms.UserID)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if !requesterPerms.CanUpdateUser(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitID = requesterPerms.CircuitID
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

	currentPerms, err := c.Access.GetLink(proposedPerms.LinkID)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if !requesterPerms.CanUpdateLink(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitID = requesterPerms.CircuitID
	resultPerms, err := c.Access.UpsertCircuitLink(proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, resultPerms
}

func DeleteCircuitUser(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	userID := c.Param("uid")
	revokedPerm, err := c.Access.GetCircuitUser(requesterPerms.CircuitID, model.UserID(userID))
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if revokedPerm.Invalid() {
		return http.StatusNotFound, nil
	}

	if !requesterPerms.CanRevokeUser(revokedPerm) {
		return http.StatusForbidden, nil
	}

	err = c.Access.DeleteCircuitUser(requesterPerms.CircuitID, revokedPerm.UserID)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}

func DeleteCircuitLink(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var linkID model.LinkID
	err := linkID.Base64Decode(c.Param("lid"))
	if err != nil {
		return http.StatusNotFound, nil
	}
	linkPerms, err := c.Access.GetLink(linkID)
	if err != nil {
		return http.StatusBadRequest, err
	}
	if linkPerms.Invalid() {
		return http.StatusNotFound, nil
	}
	if linkPerms.CircuitID != requesterPerms.CircuitID {
		return http.StatusBadRequest, errors.New("link id does not match circuit id")
	}

	if !requesterPerms.CanRevokeLink(linkPerms) {
		return http.StatusForbidden, nil
	}

	err = c.Access.DeleteLink(linkID)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}
