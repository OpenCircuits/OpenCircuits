package api

import (
	"fmt"
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/gin-gonic/gin"
)

// LIMITS
// 32MB / request,response

func pingHandler(c *Context) (interface{}, error) {
	if c.Identity().IsAnonymous() {
		return nil, ErrInsufficientPerms
	}
	return fmt.Sprintf("Thank you for pinging: %s", c.Identity()), nil
}

// RegisterRoutes adds API routes to the provided engine
func RegisterRoutes(router *gin.Engine, db model.CircuitDBFactory, auth auth.AuthenticationManager) {
	// Setup authorization middleware
	router.Use(AuthMiddleware(auth))

	// TODO: api versioning
	w := func(h HandlerFunc, s int) gin.HandlerFunc {
		return Wrap(h, db, s, http.StatusBadRequest)
	}

	router.GET("/api/ping", w(pingHandler, http.StatusOK))

	// User-saveable circuits
	router.PUT("/api/circuits/:id", w(upsertCircuit, http.StatusAccepted))
	router.GET("/api/circuits/:id", w(loadCircuit, http.StatusOK))
	router.POST("/api/circuits/:id/delete", w(deleteCircuit, http.StatusAccepted))

	router.PUT("/api/circuits/:id/link", w(upsertLink, http.StatusAccepted))
	router.GET("/api/circuits/:id/link", w(loadLink, http.StatusOK))
	router.POST("/api/circuits/:id/link/delete", w(deleteLink, http.StatusAccepted))

	router.GET("/api/circuits", w(enumerateUser, http.StatusOK))
}

type UpsertCircuitResponse struct {
	CircuitID model.CircuitID `json:"circuit_id"`
}

func upsertCircuit(c *Context) (interface{}, error) {
	var newCircuit model.Circuit
	if err := c.ShouldBindJSON(&newCircuit); err != nil {
		return nil, err
	}

	h, err := c.NewCircuitHandle("id")
	if err != nil {
		return nil, err
	}
	id, err := h.Upsert(newCircuit)
	return &UpsertCircuitResponse{CircuitID: id}, err
}

type loadCircuitMetadata struct {
	// For compatability with front-end
	ID        model.CircuitID     `json:"id"`
	Name      string              `json:"name"`
	Desc      string              `json:"desc"`
	Version   model.SchemaVersion `json:"version"`
	Thumbnail string              `json:"thumbnail"`
}

type loadCircuitResponse struct {
	Metadata loadCircuitMetadata `json:"metadata"`
	Content  string              `json:"contents"`
}

func loadCircuit(c *Context) (interface{}, error) {
	h, err := c.NewCircuitHandle("id")
	if err != nil {
		return nil, err
	}
	circuit, err := h.Load()
	return &loadCircuitResponse{
		Metadata: loadCircuitMetadata{
			ID:        h.id,
			Name:      circuit.Metadata.Name,
			Desc:      circuit.Metadata.Desc,
			Version:   circuit.Metadata.Version,
			Thumbnail: circuit.Metadata.Thumbnail,
		},
		Content: circuit.Content,
	}, err
}

func deleteCircuit(c *Context) (interface{}, error) {
	h, err := c.NewCircuitHandle("id")
	if err != nil {
		return nil, err
	}
	return nil, h.Delete()
}

func enumerateUser(c *Context) (interface{}, error) {
	if !c.Identity().CanCreate() {
		return &[]model.CircuitMetadata{}, nil
	}

	mds := c.DB.EnumerateUser(c.Identity())
	return &mds, nil
}

type UpsertLinkRequest struct {
	LinkPerm model.AccessLevel `json:"link_perm"`
	Regen    bool              `json:"regen"`
}

func upsertLink(c *Context) (interface{}, error) {
	var reqPerms UpsertLinkRequest
	if err := c.ShouldBindJSON(&reqPerms); err != nil {
		return nil, err
	}

	h, err := c.NewCircuitHandle("id")
	if err != nil {
		return nil, err
	}
	perms, err := h.UpsertLink(reqPerms.LinkPerm, reqPerms.Regen)
	return &perms, err
}

func loadLink(c *Context) (interface{}, error) {
	h, err := c.NewCircuitHandle("id")
	if err != nil {
		return nil, err
	}
	perms, err := h.LoadLink()
	return &perms, err
}

func deleteLink(c *Context) (interface{}, error) {
	h, err := c.NewCircuitHandle("id")
	if err != nil {
		return nil, err
	}
	return nil, h.DeleteLink()
}
