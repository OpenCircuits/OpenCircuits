package access

import (
	"errors"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
)

type AccessHandler = func(_ access.DataDriver, _ *gin.Context, _ access.UserPermission) (int, interface{})

func Wrapper(m access.DataDriver, f AccessHandler) func(_ *gin.Context, _ model.UserId) {
	return func(c *gin.Context, userId model.UserId) {
		// Get the requester's permission level
		requesterPerms, err := m.GetCircuitUser(c.Param("cid"), userId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, nil)
			return
		}
		if requesterPerms == nil {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		code, obj := f(m, c, *requesterPerms)

		// Cast errors specially, and omit them in release mode
		if err, ok := obj.(error); ok {
			debug := true
			if code/100 == 5 && debug {
				obj = gin.H{"error": err.Error()}
			} else {
				obj = nil
			}
		}
		c.JSON(code, obj)
	}
}

func GetCircuit(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) (int, interface{}) {
	if requesterPerms.CanEnumeratePerms() {
		return http.StatusForbidden, nil
	}

	perms, err := m.GetCircuit(requesterPerms.CircuitId)
	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusAccepted, perms
}

func UpsertCircuitUser(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) (int, interface{}) {
	// Get the proposed user permission addition
	var proposedPerms access.UserPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if !requesterPerms.CanExtendUser(proposedPerms) {
		return http.StatusForbidden, nil
	}

	// Add / update the permission in the database
	proposedPerms.CircuitId = requesterPerms.CircuitId
	err = m.UpsertCircuitUser(proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}

func UpsertCircuitLink(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) (int, interface{}) {
	// Get the proposed user permission addition
	var proposedPerms access.LinkPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		return http.StatusBadRequest, err
	}

	if !requesterPerms.CanExtendLink(proposedPerms) {
		return http.StatusForbidden, nil
	}

	// Add / update the permission in the database
	proposedPerms.CircuitId = requesterPerms.CircuitId
	resultPerms, err := m.UpsertCircuitLink(proposedPerms)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, resultPerms
}

func DeleteCircuitUser(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) (int, interface{}) {
	uid := c.Param("uid")
	revokedPerm, err := m.GetCircuitUser(requesterPerms.CircuitId, uid)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if revokedPerm == nil {
		return http.StatusNotFound, nil
	}

	if !requesterPerms.CanRevokeUser(*revokedPerm) {
		return http.StatusForbidden, nil
	}

	err = m.DeleteCircuitUser(requesterPerms.CircuitId, revokedPerm.UserId)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}

func DeleteCircuitLink(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) (int, interface{}) {
	lid := c.Param("lid")
	linkPerms, err := m.GetLink(lid)
	if err != nil {
		return http.StatusBadRequest, err
	}
	if linkPerms.CircuitId != requesterPerms.CircuitId {
		return http.StatusBadRequest, errors.New("link id does not match circuit id")
	}

	if requesterPerms.CanRevokeLink(*linkPerms) {
		return http.StatusForbidden, nil
	}

	err = m.DeleteLink(lid)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusAccepted, nil
}
