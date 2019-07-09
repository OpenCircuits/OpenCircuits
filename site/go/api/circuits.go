package api

import (
	"encoding/xml"
	"errors"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
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
		c.XML(http.StatusForbidden, err.Error())
		return
	}

	circuitId, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
		return
	}

	storageInterface := core.GetCircuitStorageInterfaceFactory().CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.XML(http.StatusNotFound, err.Error())
		return
	} else {
		if circuit.Metadata.Owner != userId {
			c.XML(http.StatusForbidden, err.Error())
			return
		}
	}

	x, err := ioutil.ReadAll(c.Request.Body)
	log.Print(x)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
		return
	}

	var newCircuit model.Circuit
	err = xml.Unmarshal(x, &newCircuit)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
		return
	}

	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(*circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	c.XML(http.StatusAccepted, circuit.Metadata)
}

func CircuitCreateHandler(c *gin.Context) {
	userId, err := authorizeRequest(c)
	if err != nil {
		c.XML(http.StatusForbidden, err.Error())
		return
	}

	storageInterface := core.GetCircuitStorageInterfaceFactory().CreateCircuitStorageInterface()

	x, err := ioutil.ReadAll(c.Request.Body)
	log.Print(x)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
		return
	}

	var newCircuit model.Circuit
	err = xml.Unmarshal(x, &newCircuit)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
		return
	}

	circuit := storageInterface.NewCircuit()
	circuit.Metadata.Owner = userId
	circuit.Metadata.Version = 0
	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	c.XML(http.StatusAccepted, circuit.Metadata)
}

func CircuitLoadHandler(c *gin.Context) {
	userId, err := authorizeRequest(c)
	if err != nil {
		c.XML(http.StatusForbidden, err.Error())
		return
	}

	circuitId, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
	}

	storageInterface := core.GetCircuitStorageInterfaceFactory().CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.XML(http.StatusNotFound, err.Error())
		return
	} else {
		// Only owner can access... for now
		if circuit.Metadata.Owner != userId {
			c.XML(http.StatusNotFound, err.Error())
			return
		}
	}

	c.XML(http.StatusOK, circuit)
}

// XML is killing me
type metadataList struct {
	Metadata []model.CircuitMetadata `xml:"metadata"`
}

func CircuitQueryHandler(c *gin.Context) {
	userId, err := authorizeRequest(c)
	if err != nil {
		c.XML(http.StatusForbidden, err.Error())
		return
	}

	storageInterface := core.GetCircuitStorageInterfaceFactory().CreateCircuitStorageInterface()
	circuits := storageInterface.EnumerateCircuits(userId)
	if circuits == nil {
		circuits = []model.CircuitMetadata{}
	}
	c.XML(http.StatusOK, metadataList{Metadata: circuits})
}
