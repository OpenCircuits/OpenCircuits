package circuits

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

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

func Store(c *api.Context) (int, interface{}) {
	circuitId := c.Param("id")
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		return http.StatusNotFound, nil
	}
	if circuit.Metadata.Owner != c.Identity() {
		return http.StatusForbidden, nil
	}

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
	if err != nil {
		return http.StatusBadRequest, err.Error()
	}

	// Preserve the owner, which may be different
	newCircuit.Metadata.Owner = circuit.Metadata.Owner

	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(*circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, circuit.Metadata
}

func Create(c *api.Context) (int, interface{}) {
	userId := c.Identity()
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
	if err != nil {
		return http.StatusBadRequest, err.Error()
	}

	circuit := storageInterface.NewCircuit()
	circuit.Metadata.Owner = userId
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

	// The initial "Can Delete" logic is the same as "Is Owner"
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil || circuit.Metadata.Owner != c.Identity() {
		return http.StatusForbidden, nil
	}

	storageInterface.DeleteCircuit(circuitId)
	return http.StatusOK, nil
}
