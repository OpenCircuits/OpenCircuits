package ot

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/session"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func RegisterRoutes(router *gin.Engine, accessDriver interfaces.AccessDriver, sessionManager *session.SessionManager) {
	// TODO: This should ONLY use the always-allow feature in test mode...
	wsFactory := &conn.WebSocketConnectionFactory{
		Upgrader:    websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }},
		MessageType: websocket.TextMessage,
	}
	establish := func(c *gin.Context) {
		circuitID := c.Param("cid")
		cn := wsFactory.Establish(c)
		sessionManager.Start(circuitID, conn.NewDefaultConnection(cn))
	}

	// OT
	router.GET("/ot/:cid", establish)
}
