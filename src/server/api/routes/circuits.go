package routes

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type circuitRoutes struct{}

type circuitMetadata struct {
	Name      string `json:"name"`
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

	var newCircuit circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return http.StatusBadRequest, err
	}

	if !c.Access.UserPermission(circuitID, c.Identity()).CanEdit() {
		return http.StatusForbidden, nil
	}

	circuit := c.Circuits.LoadCircuit(circuitID)
	if circuit == nil {
		return http.StatusNotFound, nil
	}

	circuit.Update(newCircuit.toCircuit())
	c.Circuits.UpsertCircuit(*circuit)

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, &circuit.Metadata
}

func (circuitRoutes) create(c *api.Context) (int, interface{}) {
	var newCircuit circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return http.StatusBadRequest, err
	}

	var circuit model.Circuit
	circuit.Metadata.ID = model.NewCircuitID()
	circuit.Metadata.Owner = c.Identity()

	circuit.Update(newCircuit.toCircuit())
	c.Circuits.UpsertCircuit(circuit)

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

	circuit := c.Circuits.LoadCircuit(circuitID)
	if circuit == nil {
		return http.StatusNotFound, nil
	}

	return http.StatusOK, circuit
}

func (circuitRoutes) query(c *api.Context) (int, interface{}) {
	var ids []model.CircuitID
	for _, perm := range c.Access.UserPermissions(c.Identity()) {
		if perm.CanView() {
			ids = append(ids, perm.CircuitID)
		}
	}
	return http.StatusOK, c.Circuits.LoadMetadata(ids)
}

func (circuitRoutes) delete(c *api.Context) (int, interface{}) {
	var circuitID model.CircuitID
	if err := circuitID.Base64Decode(c.Param("id")); err != nil {
		return http.StatusNotFound, err
	}

	if !c.Access.UserPermission(circuitID, c.Identity()).CanDelete() {
		return http.StatusForbidden, nil
	}

	c.Circuits.DeleteCircuit(circuitID)
	return http.StatusOK, nil
}
