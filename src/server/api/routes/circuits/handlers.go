package circuits

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

func Store(c *api.Context) (int, interface{}) {
	circuitId := c.Param("id")
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	var newCircuit model.Circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return http.StatusBadRequest, err
	}

	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		return http.StatusNotFound, nil
	}

	// TODO: Replace with access check
	if circuit.Metadata.Owner != c.Identity() {
		return http.StatusForbidden, nil
	}

	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(*circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, circuit.Metadata
}

func Create(c *api.Context) (int, interface{}) {
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	var newCircuit model.Circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return http.StatusBadRequest, err
	}

	circuit := storageInterface.NewCircuit()
	circuit.Metadata.Owner = c.Identity()
	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, circuit.Metadata
}

func Load(c *api.Context) (int, interface{}) {
	circuitId := c.Param("id")
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		return http.StatusNotFound, nil
	}

	// TODO: Replace with access check
	if circuit.Metadata.Owner != c.Identity() {
		return http.StatusForbidden, nil
	}

	return http.StatusOK, circuit
}

func Query(c *api.Context) (int, interface{}) {
	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	return http.StatusOK, storageInterface.EnumerateCircuits(c.Identity())
}

func Delete(c *api.Context) (int, interface{}) {
	circuitId := c.Param("id")
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	circuit := storageInterface.LoadCircuit(circuitId)

	// TODO: Replace with access check
	if circuit == nil || circuit.Metadata.Owner != c.Identity() {
		return http.StatusForbidden, nil
	}

	storageInterface.DeleteCircuit(circuitId)
	return http.StatusOK, nil
}
