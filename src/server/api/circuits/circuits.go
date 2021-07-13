package circuits

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/access"
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

func accessCheck(c *api.Context, circuitId model.CircuitId, m func(_ access.UserPermission) bool) int {
	userId := c.Identity()

	// Access check
	requesterPerms, err := c.Access.GetCircuitUser(circuitId, userId)
	if err != nil || requesterPerms == nil {
		return http.StatusBadRequest
	}
	if !m(*requesterPerms) {
		return http.StatusForbidden
	}
	return 0
}

func Store(c *api.Context) (int, interface{}) {
	circuitId := c.Param("id")
	if code := accessCheck(c, circuitId, access.UserPermission.CanEdit); code != 0 {
		return code, nil
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		return http.StatusNotFound, nil
	}

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
	if err != nil {
		return http.StatusBadRequest, err.Error()
	}

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

	// Add user as owner in access db
	c.Access.UpsertCircuitUser(access.UserPermission{
		UserId:      userId,
		CircuitId:   circuit.Metadata.ID,
		AccessLevel: access.AccessCreater,
	})

	// Returned the updated metadata so the client can get any changes the server made to it
	return http.StatusAccepted, circuit.Metadata
}

func Load(c *api.Context) (int, interface{}) {
	circuitId := c.Param("id")
	if code := accessCheck(c, circuitId, access.UserPermission.CanView); code != 0 {
		return code, nil
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		return http.StatusNotFound, nil
	}
	return http.StatusOK, circuit
}

func Query(c *api.Context) (int, interface{}) {
	userId := c.Identity()
	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	circuits := storageInterface.EnumerateCircuits(userId)
	if circuits == nil {
		circuits = []model.CircuitMetadata{}
	}
	return http.StatusOK, circuits
}

func Delete(c *api.Context) (int, interface{}) {
	circuitId := c.Param("id")
	if code := accessCheck(c, circuitId, access.UserPermission.CanDelete); code != 0 {
		return code, nil
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	storageInterface.DeleteCircuit(circuitId)

	c.Access.DeleteCircuit(circuitId)

	return http.StatusOK, nil
}
