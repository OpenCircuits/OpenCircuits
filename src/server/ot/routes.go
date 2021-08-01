package ot

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/session"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func RegisterRoutes(router *gin.Engine, accessDriver interfaces.AccessDriver, sessionManager *session.SessionManager) {
	wsFactory := &conn.WebSocketConnectionFactory{
		Upgrader:    websocket.Upgrader{},
		MessageType: websocket.TextMessage,
	}
	establish := func(c *gin.Context) {
		circuitID := c.Param("cid")
		conn := wsFactory.Establish(c)
		sessionManager.Start(circuitID, conn)
	}

	// OT
	router.POST("/api/ot/:cid", establish)
}
