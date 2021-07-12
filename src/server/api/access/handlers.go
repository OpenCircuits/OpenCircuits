package access

import (
	"errors"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/gin-gonic/gin"
)

type AccessHandler = func(_ *api.Context, _ access.UserPermission) (int, interface{})

func Wrapper(f AccessHandler) api.HandlerFunc {
	return func(c *api.Context) {
		userId := c.Identity()

		// Get the requester's permission level
		requesterPerms, err := c.Access.GetCircuitUser(c.Param("cid"), userId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, nil)
			return
		}
		if requesterPerms == nil {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		code, obj := f(c, *requesterPerms)

		// Cast errors specially, and omit them in release mode
		if err, ok := obj.(error); ok {
			debug := true
			if code/100 == 5 && !debug {
				obj = nil
			} else {
				obj = gin.H{"error": err.Error()}
			}
		}
		c.JSON(code, obj)
	}
}

func GetCircuit(c *api.Context, requesterPerms access.UserPermission) (int, interface{}) {
	if !requesterPerms.CanEnumeratePerms() {
		return http.StatusForbidden, nil
	}

	perms, err := c.Access.GetCircuit(requesterPerms.CircuitId)
	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusOK, perms
}

func UpsertCircuitUser(c *api.Context, requesterPerms access.UserPermission) (int, interface{}) {
	var proposedPerms access.UserPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	if !requesterPerms.CanExtendUser(proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitId = requesterPerms.CircuitId
	err = c.Access.UpsertCircuitUser(proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}

func UpsertCircuitLink(c *api.Context, requesterPerms access.UserPermission) (int, interface{}) {
	var proposedPerms access.LinkPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	if !requesterPerms.CanExtendLink(proposedPerms) {
		return http.StatusForbidden, nil
	}

	proposedPerms.CircuitId = requesterPerms.CircuitId
	resultPerms, err := c.Access.UpsertCircuitLink(proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, resultPerms
}

func DeleteCircuitUser(c *api.Context, requesterPerms access.UserPermission) (int, interface{}) {
	uid := c.Param("uid")
	revokedPerm, err := c.Access.GetCircuitUser(requesterPerms.CircuitId, uid)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if revokedPerm == nil {
		return http.StatusNotFound, nil
	}

	if !requesterPerms.CanRevokeUser(*revokedPerm) {
		return http.StatusForbidden, nil
	}

	err = c.Access.DeleteCircuitUser(requesterPerms.CircuitId, revokedPerm.UserId)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}

func DeleteCircuitLink(c *api.Context, requesterPerms access.UserPermission) (int, interface{}) {
	lid := c.Param("lid")
	linkPerms, err := c.Access.GetLink(lid)
	if err != nil {
		return http.StatusBadRequest, err
	}
	if linkPerms.CircuitId != requesterPerms.CircuitId {
		return http.StatusBadRequest, errors.New("link id does not match circuit id")
	}

	if !requesterPerms.CanRevokeLink(*linkPerms) {
		return http.StatusForbidden, nil
	}

	err = c.Access.DeleteLink(lid)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}
