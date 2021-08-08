package conn

import (
	"errors"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketConnectionFactory struct {
	// TODO: Add CSRF (CSWSH) token to handshake
	Upgrader websocket.Upgrader
	// Either websocket.TextMessage or websocket.BinaryMessage
	MessageType int
}

func (wf *WebSocketConnectionFactory) Establish(c *gin.Context) RawConnection {
	conn, err := wf.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Print("Failed to upgrade connection:", err)
		return nil
	}

	return webSocketConnection{
		conn: conn,
		mt:   websocket.TextMessage,
	}
}

type webSocketConnection struct {
	conn *websocket.Conn
	mt   int
}

func (ws webSocketConnection) Recv() ([]byte, error) {
	mt, message, err := ws.conn.ReadMessage()
	if err != nil {
		// Assume this means ws.conn is closed
		return nil, err
	}
	if mt != ws.mt {
		return nil, errors.New("mismatched ws message type")
	}
	return message, nil
}

func (ws webSocketConnection) Send(response []byte) error {
	return ws.conn.WriteMessage(ws.mt, response)
}

func (ws webSocketConnection) Close() error {
	return ws.conn.Close()
}
