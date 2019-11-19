package api

import (
	"encoding/xml"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"net/http"
)

func circuitHandler(m interfaces.CircuitStorageInterfaceFactory, f func(_ interfaces.CircuitStorageInterfaceFactory, _ *gin.Context, _ model.UserId)) func(_ *gin.Context, _ model.UserId) {
	return func(c *gin.Context, userId model.UserId) {
		f(m, c, userId)
	}
}

func parseCircuitRequestData(r io.Reader) (model.Circuit, error) {
	x, err := ioutil.ReadAll(r)
	if err != nil {
		return model.Circuit{}, err
	}

	var newCircuit model.Circuit
	err = xml.Unmarshal(x, &newCircuit)
	if err != nil {
		return model.Circuit{}, err
	}
	return newCircuit, nil
}

func circuitStoreHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	circuitId := c.Param("id")

	storageInterface := m.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.XML(http.StatusNotFound, nil)
		return
	} else {
		if circuit.Metadata.Owner != userId {
			c.XML(http.StatusForbidden, nil)
			return
		}
	}

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
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

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
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
	circuitId := c.Param("id")

	storageInterface := m.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.XML(http.StatusNotFound, nil)
		return
	}

	// Only owner can access... for now
	if circuit.Metadata.Owner != userId {
		c.XML(http.StatusNotFound, nil)
		return
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

func circuitDeleteHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	circuitId := c.Param("id")
	storageInterface := m.CreateCircuitStorageInterface()

	// The initial "Can Delete" logic is the same as "Is Owner"
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil || circuit.Metadata.Owner != userId {
		c.XML(http.StatusForbidden, nil)
		return
	}

	storageInterface.DeleteCircuit(circuitId)
	c.XML(http.StatusOK, nil)
}
