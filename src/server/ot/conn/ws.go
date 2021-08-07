package conn

import (
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

func (wf *WebSocketConnectionFactory) Establish(c *gin.Context) Connection {
	conn, err := wf.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Print("Failed to upgrade connection:", err)
		return nil
	}

	ws := &webSocketConnection{
		done: make(chan bool),
		recv: make(chan []byte),
		conn: conn,
		mt:   websocket.TextMessage,
	}

	go ws.listener()

	return ws
}

type webSocketConnection struct {
	done chan bool
	recv chan []byte
	conn *websocket.Conn
	mt   int
}

func (ws webSocketConnection) listener() {
	defer ws.Close()
	for {
		mt, message, err := ws.conn.ReadMessage()
		if err != nil {
			// Assume this means ws.conn is closed
			return
		}
		if mt != ws.mt {
			log.Println("mismatched ws message type")
			return
		}
		ws.recv <- message
	}
}

func (ws webSocketConnection) Recv() <-chan []byte {
	return ws.recv
}

func (ws webSocketConnection) Send(response []byte) {
	if err := ws.conn.WriteMessage(ws.mt, response); err != nil {
		log.Println("failed to send to ws: ", err)
		ws.Close()
	}
}

func (ws webSocketConnection) Close() {
	close(ws.recv)
	if err := ws.conn.Close(); err != nil {
		log.Println("failed to close ws: ", err)
	}
}
