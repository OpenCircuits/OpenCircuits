package circuit

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

type queryMsg struct {
	Owners   []model.UserID `json:"user_ids"`
	Keywords []string       `json:"keywords"`
}

// Query fetches all circuit metadata entries that match the request
//	and that the requesting user can access
func Query(c *api.Context) (int, interface{}) {
	return http.StatusNotImplemented, nil
}

// Create initializes a new circuit for the provided user with a fresh circuit ID
//	NOTE: the returned circuit ID is used in the ot algorithm
func Create(c *api.Context) (int, interface{}) {
	userID := c.Identity()
	if !model.CanCreate(userID) {
		return http.StatusForbidden, nil
	}

	// Create the circuit in the metadata table
	circuitID := model.NewCircuitID()
	c.NewCircuits.NewCircuit(circuitID, userID)

	// Add the creator to the access permissions
	c.Access.UpsertCircuitUser(model.UserPermission{
		CircuitID: circuitID,
		UserID:    userID,
		BasePermission: model.BasePermission{
			AccessLevel: model.AccessCreator,
		},
	})

	res := model.ImplicitMetadata{
		ID:      circuitID,
		Creator: userID,
		Version: "TODO",
	}

	return http.StatusAccepted, res
}
