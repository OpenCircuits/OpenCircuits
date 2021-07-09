package access

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
)

func Wrapper(m access.DataDriver, f func(_ access.DataDriver, _ *gin.Context, _ access.UserPermission)) func(_ *gin.Context, _ model.UserId) {
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
		f(m, c, *requesterPerms)
	}
}

func GetCircuit(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) {
	// TODO User must have edit permissions to view all
	if requesterPerms.AccessLevel >= access.AccessEdit {
		c.JSON(http.StatusForbidden, nil)
		return
	}

	perms, err := m.GetCircuit(requesterPerms.CircuitId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, nil)
		return
	}

	c.JSON(http.StatusAccepted, perms)
}

func UpsertCircuitUser(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) {
	// Get the proposed user permission addition
	var proposedPerms access.UserPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO Check that the requesting user can extend the requested permissions
	if requesterPerms.AccessLevel < proposedPerms.AccessLevel {
		c.JSON(http.StatusForbidden, nil)
		return
	}

	// Add / update the permission in the database
	proposedPerms.CircuitId = requesterPerms.CircuitId
	err = m.UpsertCircuitUser(proposedPerms)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, nil)
}

func UpsertCircuitLink(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) {
	// Get the proposed user permission addition
	var proposedPerms access.LinkPermission
	err := c.ShouldBindJSON(&proposedPerms)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO Check that the requesting user can extend the requested permissions
	if requesterPerms.AccessLevel < proposedPerms.AccessLevel {
		c.JSON(http.StatusForbidden, nil)
		return
	}

	// Add / update the permission in the database
	proposedPerms.CircuitId = requesterPerms.CircuitId
	resultPerms, err := m.UpsertCircuitLink(proposedPerms)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, resultPerms)
}

func DeleteCircuitUser(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) {
	uid := c.Param("uid")

	// TODO Check that the requesting user can delete the requested permissions
	if requesterPerms.AccessLevel < access.AccessEdit {
		c.JSON(http.StatusForbidden, nil)
		return
	}

	err := m.DeleteCircuitUser(requesterPerms.CircuitId, uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, nil)
}

func DeleteCircuitLink(m access.DataDriver, c *gin.Context, requesterPerms access.UserPermission) {
	lid := c.Param("lid")
	linkPerms, err := m.GetLink(lid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if linkPerms.CircuitId != requesterPerms.CircuitId {
		c.JSON(http.StatusBadRequest, gin.H{"error": "link id does not match circuit id"})
		return
	}

	// TODO Check that the requesting user can delte the requested permissions
	if requesterPerms.AccessLevel < access.AccessEdit {
		c.JSON(http.StatusForbidden, nil)
		return
	}

	err = m.DeleteLink(lid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, nil)
}
