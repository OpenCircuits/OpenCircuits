package api

import (
	"encoding/xml"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
)

func circuitHandler(m interfaces.CircuitStorageInterfaceFactory, f func (_ interfaces.CircuitStorageInterfaceFactory, _ *gin.Context, _ model.UserId)) func (_ *gin.Context, _ model.UserId) {
	return func(c *gin.Context, userId model.UserId) {
		f(m, c, userId)
	}
}

func circuitStoreHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	circuitId, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
		return
	}

	storageInterface := m.CreateCircuitStorageInterface()
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

func circuitCreateHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	storageInterface := m.CreateCircuitStorageInterface()

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
	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	c.XML(http.StatusAccepted, circuit.Metadata)
}

func circuitLoadHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	circuitId, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.XML(http.StatusBadRequest, err.Error())
	}

	storageInterface := m.CreateCircuitStorageInterface()
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

func circuitQueryHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	storageInterface := m.CreateCircuitStorageInterface()
	circuits := storageInterface.EnumerateCircuits(userId)
	if circuits == nil {
		circuits = []model.CircuitMetadata{}
	}
	c.XML(http.StatusOK, metadataList{Metadata: circuits})
}
