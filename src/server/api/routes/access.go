package routes

import (
	"errors"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type AccessHandler = func(*api.Context, model.UserPermission) (int, interface{})

type accessRoutes struct{}

func (accessRoutes) wrapper(f AccessHandler) api.HandlerFunc {
	return func(c *api.Context) (int, interface{}) {
		userID := c.Identity()

		// Decode the circuit ID
		var circuitID model.CircuitID
		if circuitID.Base64Decode(c.Param("cid")) != nil {
			return http.StatusNotFound, nil
		}

		// Get the requester's permission level
		requesterPerms := c.Access.UserPermission(circuitID, userID)
		if !requesterPerms.CanView() {
			return http.StatusNotFound, nil
		}
		return f(c, requesterPerms)
	}
}

func (accessRoutes) circuitPermissions(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	if !requesterPerms.CanEnumeratePerms() {
		return http.StatusForbidden, nil
	}

	return http.StatusOK, c.Access.CircuitPermissions(requesterPerms.CircuitID)
}

func (accessRoutes) upsertUserPermission(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var proposedPerms model.UserPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	currentPerms := c.Access.UserPermission(requesterPerms.CircuitID, proposedPerms.UserID)

	if !requesterPerms.CanUpdateUser(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitID = requesterPerms.CircuitID
	c.Access.UpsertUserPermission(proposedPerms)

	return http.StatusAccepted, nil
}

func (accessRoutes) upsertLinkPermission(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var proposedPerms model.LinkPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	currentPerms := c.Access.LinkPermission(proposedPerms.LinkID)
	if !requesterPerms.CanUpdateLink(currentPerms, proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitID = requesterPerms.CircuitID
	resultPerms := c.Access.UpsertLinkPermission(proposedPerms)

	return http.StatusAccepted, resultPerms
}

func (accessRoutes) deleteUserPermission(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	userID := c.Param("uid")
	revokedPerm := c.Access.UserPermission(requesterPerms.CircuitID, model.UserID(userID))

	if !requesterPerms.CanRevokeUser(revokedPerm) {
		return http.StatusForbidden, nil
	}

	c.Access.DeleteUserPermission(requesterPerms.CircuitID, revokedPerm.UserID)

	return http.StatusAccepted, nil
}

func (accessRoutes) deleteLinkPermission(c *api.Context, requesterPerms model.UserPermission) (int, interface{}) {
	var linkID model.LinkID
	err := linkID.Base64Decode(c.Param("lid"))
	if err != nil {
		return http.StatusNotFound, nil
	}
	linkPerms := c.Access.LinkPermission(linkID)
	if !linkPerms.Valid() {
		return http.StatusNotFound, nil
	}
	if linkPerms.CircuitID != requesterPerms.CircuitID {
		return http.StatusBadRequest, errors.New("link id does not match circuit id")
	}

	if !requesterPerms.CanRevokeLink(linkPerms) {
		return http.StatusForbidden, nil
	}

	c.Access.DeleteLinkPermission(linkID)

	return http.StatusAccepted, nil
}
