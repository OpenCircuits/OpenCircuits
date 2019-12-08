package api

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
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
	err = json.Unmarshal(x, &newCircuit)
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
		c.JSON(http.StatusNotFound, nil)
		return
	}
	if circuit.Metadata.Owner != userId {
		c.JSON(http.StatusForbidden, nil)
		return
	}

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(*circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	c.JSON(http.StatusAccepted, circuit.Metadata)
}

func circuitCreateHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	storageInterface := m.CreateCircuitStorageInterface()

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
	}

	circuit := storageInterface.NewCircuit()
	circuit.Metadata.Owner = userId
	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	c.JSON(http.StatusAccepted, circuit.Metadata)
}

func circuitLoadHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	circuitId := c.Param("id")

	storageInterface := m.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.JSON(http.StatusNotFound, nil)
		return
	}

	// Only owner can access... for now
	if circuit.Metadata.Owner != userId {
		c.JSON(http.StatusNotFound, nil)
		return
	}

	c.JSON(http.StatusOK, circuit)
}

func circuitQueryHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	storageInterface := m.CreateCircuitStorageInterface()
	circuits := storageInterface.EnumerateCircuits(userId)
	if circuits == nil {
		circuits = []model.CircuitMetadata{}
	}
	c.JSON(http.StatusOK, circuits)
}

func circuitDeleteHandler(m interfaces.CircuitStorageInterfaceFactory, c *gin.Context, userId model.UserId) {
	circuitId := c.Param("id")
	storageInterface := m.CreateCircuitStorageInterface()

	// The initial "Can Delete" logic is the same as "Is Owner"
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil || circuit.Metadata.Owner != userId {
		c.JSON(http.StatusForbidden, nil)
		return
	}

	storageInterface.DeleteCircuit(circuitId)
	c.JSON(http.StatusOK, nil)
}
