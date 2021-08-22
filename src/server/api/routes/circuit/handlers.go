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

// Update updates the provided metadata entries and
//	creates a new milestone circuit if the content is provided
func Update(c *api.Context) (int, interface{}) {
	return http.StatusNotImplemented, nil
}

// Create initializes a new circuit for the provided user with a fresh circuit ID
//	NOTE: the returned circuit ID is used in the ot algorithm
func Create(c *api.Context) (int, interface{}) {
	return http.StatusNotImplemented, nil
}

// Delete removes a circuit and all of its data from the server
//	Circuits must already be marked trashed to delete them
func Delete(c *api.Context) (int, interface{}) {
	return http.StatusNotImplemented, nil
}
