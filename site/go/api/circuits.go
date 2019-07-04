package api

import (
	"errors"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
)

func authorizeRequest(c *gin.Context) (string, error) {
	session := sessions.Default(c)
	var userId string
	maybeUserId := session.Get("user-id")
	if maybeUserId != nil {
		userId = maybeUserId.(string)
	} else {
		return "", errors.New("user not logged in")
	}
	return userId, nil
}

func CircuitStoreHandler(c *gin.Context) {
	userId, err := authorizeRequest(c)
	if err != nil {
		c.JSON(http.StatusForbidden, err)
		return
	}

	circuitId, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
	}

	storageInterface := core.GetCircuitStorageInterfaceFactory().CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		newCircuit := storageInterface.NewCircuit()
		circuit = &newCircuit
		circuit.Metadata.Owner = userId
	} else {
		if circuit.Metadata.Owner != userId {
			c.JSON(http.StatusForbidden, nil)
			return
		}
	}

	x, err := ioutil.ReadAll(c.Request.Body)
	log.Print(x)
	if err != nil {
		c.JSON(http.StatusInternalServerError, nil)
		return
	}

	circuit.Content = string(x)
	storageInterface.UpdateCircuit(*circuit)

	c.JSON(http.StatusOK, circuit.Metadata)
}

func CircuitLoadHandler(c *gin.Context) {
	userId, err := authorizeRequest(c)
	if err != nil {
		c.JSON(http.StatusForbidden, err.Error())
		return
	}

	circuitId, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
	}

	storageInterface := core.GetCircuitStorageInterfaceFactory().CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.JSON(http.StatusNotFound, nil)
		return
	} else {
		// Only owner can access... for now
		if circuit.Metadata.Owner != userId {
			c.JSON(http.StatusNotFound, nil)
			return
		}
	}

	c.JSON(http.StatusOK, circuit)
}

func CircuitQueryHandler(c *gin.Context) {
	userId, err := authorizeRequest(c)
	if err != nil {
		c.JSON(http.StatusForbidden, err.Error())
		return
	}

	storageInterface := core.GetCircuitStorageInterfaceFactory().CreateCircuitStorageInterface()
	circuits := storageInterface.EnumerateCircuits(userId)
	c.JSON(http.StatusOK, circuits)
}
