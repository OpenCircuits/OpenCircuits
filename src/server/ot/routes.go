package ot

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/session"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func RegisterRoutes(router *gin.Engine, launcher session.Launcher) {
	// TODO: This should ONLY use the always-allow feature in test mode...
	wsFactory := &conn.WebSocketConnectionFactory{
		Upgrader:    websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }},
		MessageType: websocket.TextMessage,
	}
	establishCircuitID := func(c *gin.Context) {
		var circuitID model.CircuitID
		err := circuitID.Base64Decode(c.Param("cid"))
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		cn := wsFactory.Establish(c)
		launcher.LaunchCircuitID(conn.NewDefaultConnection(cn), circuitID)
	}
	establishLinkID := func(c *gin.Context) {
		var linkID model.LinkID
		err := linkID.Base64Decode(c.Param("lid"))
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}

		// Translate the link ID
		link, err := launcher.AccessDriver.GetLink(linkID)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		if link.Invalid() {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}

		cn := wsFactory.Establish(c)
		launcher.LaunchLinkID(conn.NewDefaultConnection(cn), link)
	}

	// OT
	router.GET("/ot/c/:cid", establishCircuitID)
	router.GET("/ot/l/:lid", establishLinkID)
}
