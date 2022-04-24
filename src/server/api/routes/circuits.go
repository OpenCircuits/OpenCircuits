package routes

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type circuitRoutes struct{}

type circuitMetadata struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Owner     string `json:"owner"`
	Desc      string `json:"desc"`
	Thumbnail string `json:"thumbnail"`
	Version   string `json:"version"`
}

// Use a separate transmission struct since UUID types (id) fail to validate when empty
type circuit struct {
	Metadata circuitMetadata `json:"metadata"`
	Designer string          `json:"contents"`
}

func (c circuit) toCircuit() model.Circuit {
	return model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      c.Metadata.Name,
			Desc:      c.Metadata.Desc,
			Thumbnail: c.Metadata.Thumbnail,
			Version:   c.Metadata.Version,
		},
		Designer: c.Designer,
	}
}

func (circuitRoutes) store(c *api.Context) (int, interface{}) {
	var circuitID model.CircuitID
	if err := circuitID.Base64Decode(c.Param("id")); err != nil {
		return http.StatusNotFound, err
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	var newCircuit circuit
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

	circuit.Update(newCircuit.toCircuit())
	storageInterface.UpsertCircuit(*circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, &circuit.Metadata
}

func (circuitRoutes) create(c *api.Context) (int, interface{}) {
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	var newCircuit circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return http.StatusBadRequest, err
	}

	var circuit model.Circuit
	circuit.Metadata.ID = model.NewCircuitID()
	circuit.Metadata.Owner = c.Identity()

	circuit.Update(newCircuit.toCircuit())
	storageInterface.UpsertCircuit(circuit)

	c.Access.UpsertUserPermission(model.NewCreatorPermission(circuit.Metadata.ID, c.Identity()))

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, &circuit.Metadata
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
