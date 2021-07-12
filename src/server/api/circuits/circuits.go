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

func accessCheck(c *api.Context, circuitId model.CircuitId, m func(_ access.UserPermission) bool) bool {
	userId := c.Identity()

	// Access check
	requesterPerms, err := c.Access.GetCircuitUser(circuitId, userId)
	if err != nil || requesterPerms == nil {
		c.JSON(http.StatusBadRequest, nil)
		return false
	}
	if !m(*requesterPerms) {
		c.JSON(http.StatusForbidden, nil)
		return false
	}
	return true
}

func Store(c *api.Context) {
	circuitId := c.Param("id")
	if !accessCheck(c, circuitId, access.UserPermission.CanEdit) {
		return
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.JSON(http.StatusNotFound, nil)
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

func Create(c *api.Context) {
	userId := c.Identity()
	storageInterface := c.Circuits.CreateCircuitStorageInterface()

	newCircuit, err := parseCircuitRequestData(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return
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
	c.JSON(http.StatusAccepted, circuit.Metadata)
}

func Load(c *api.Context) {
	circuitId := c.Param("id")
	if !accessCheck(c, circuitId, access.UserPermission.CanView) {
		return
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	circuit := storageInterface.LoadCircuit(circuitId)
	if circuit == nil {
		c.JSON(http.StatusNotFound, nil)
		return
	}
	c.JSON(http.StatusOK, circuit)
}

func Query(c *api.Context) {
	userId := c.Identity()
	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	circuits := storageInterface.EnumerateCircuits(userId)
	if circuits == nil {
		circuits = []model.CircuitMetadata{}
	}
	c.JSON(http.StatusOK, circuits)
}

func Delete(c *api.Context) {
	circuitId := c.Param("id")
	if !accessCheck(c, circuitId, access.UserPermission.CanDelete) {
		return
	}

	storageInterface := c.Circuits.CreateCircuitStorageInterface()
	storageInterface.DeleteCircuit(circuitId)

	c.Access.DeleteCircuit(circuitId)

	c.JSON(http.StatusOK, nil)
}
