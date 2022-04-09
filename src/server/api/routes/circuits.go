package routes

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type circuitRoutes struct{}

func (circuitRoutes) store(c *api.Context) (int, interface{}) {
	var circuitID model.CircuitID
	if err := circuitID.Base64Decode(c.Param("id")); err != nil {
		return http.StatusNotFound, err
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	var newCircuit model.Circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return http.StatusBadRequest, err
	}

	if !c.Access.UserPermission(circuitID, c.Identity()).CanEdit() {
		return http.StatusForbidden, nil
	}

	circuit := storageInterface.LoadCircuit(circuitID)
	if circuit == nil {
		return http.StatusNotFound, nil
	}

	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(*circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, circuit.Metadata
}

func (circuitRoutes) create(c *api.Context) (int, interface{}) {
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	var newCircuit model.Circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return http.StatusBadRequest, err
	}

	circuit := storageInterface.NewCircuit()
	circuit.Metadata.Owner = c.Identity()
	circuit.Update(newCircuit)
	storageInterface.UpdateCircuit(circuit)

	c.Access.UpsertUserPermission(model.NewCreatorPermission(circuit.Metadata.ID, c.Identity()))

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, circuit.Metadata
}

func (circuitRoutes) load(c *api.Context) (int, interface{}) {
	var circuitID model.CircuitID
	if err := circuitID.Base64Decode(c.Param("id")); err != nil {
		return http.StatusNotFound, err
	}

	if !c.Access.UserPermission(circuitID, c.Identity()).CanView() {
		return http.StatusNotFound, nil
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitID)
	if circuit == nil {
		return http.StatusNotFound, nil
	}

	return http.StatusOK, circuit
}

func (circuitRoutes) query(c *api.Context) (int, interface{}) {
	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	return http.StatusOK, storageInterface.EnumerateCircuits(c.Identity())
}

func (circuitRoutes) delete(c *api.Context) (int, interface{}) {
	var circuitID model.CircuitID
	if err := circuitID.Base64Decode(c.Param("id")); err != nil {
		return http.StatusNotFound, err
	}

	if !c.Access.UserPermission(circuitID, c.Identity()).CanDelete() {
		return http.StatusForbidden, nil
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	storageInterface.DeleteCircuit(circuitID)
	return http.StatusOK, nil
}
