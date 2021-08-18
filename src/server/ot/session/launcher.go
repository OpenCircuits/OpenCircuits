package session

import (
	"errors"
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/conn"
	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
)

// Launcher launches sessions
type Launcher struct {
	DocumentManager doc.DocumentManager
	AccessDriver    interfaces.AccessDriver
	AuthManager     auth.AuthenticationManager
}

// prelimSession is a session that has not joined the document yet.
//	It is waiting on the client to send the JoinDocument message.
func (l *Launcher) prelimSession(c conn.Connection) (UserID model.UserId, LogClock uint64, err error) {
	for msg := range c.Recv() {
		switch msg := msg.(type) {
		case conn.JoinDocument:
			LogClock = msg.LogClock
			UserID, err = l.AuthManager.ExtractIdentity(msg.AuthType, msg.AuthID)
			if err != nil {
				c.Send(conn.CloseMessage{
					Reason: err.Error(),
				})
				c.Close()
			}
			return
		default:
			log.Println("prelimSession received unexpected message type from client")
		}
	}
	err = errors.New("connection closed")
	return
}

func (l *Launcher) Launch(circuitID model.CircuitId, logClock uint64, userID model.UserId, c conn.Connection, access AccessProvider) {
	// Get the document
	doc, err := l.DocumentManager.Get(circuitID)
	if err != nil {
		c.Send(conn.CloseMessage{
			Reason: "failed to connect to document",
		})
		c.Close()
		return
	}

	// Check the permissions
	if !access.Permissions().CanView() {
		c.Send(conn.CloseMessage{
			Reason: "forbidden",
		})
		c.Close()
		return
	}

	// Spawn the session
	_ = NewSession(SessionParam{
		UserID:    userID,
		SessionID: utils.RandToken(32),
		Conn:      c,
		Doc:       doc,
		Access:    access,
	}, logClock)
}

func (l *Launcher) LaunchCircuitID(c conn.Connection, circuitID model.CircuitId) {
	// Process the join message
	userID, logClock, err := l.prelimSession(c)
	if err != nil {
		return
	}

	// Setup the permissions
	access := UserAccessProvider{
		AccessDriver: l.AccessDriver,
		UserID:       userID,
		CircuitID:    circuitID,
	}

	l.Launch(circuitID, logClock, userID, c, access)
}

func (l *Launcher) LaunchLinkID(c conn.Connection, link model.LinkPermission) {
	// Process the join message
	userID, logClock, err := l.prelimSession(c)
	if err != nil {
		return
	}

	// Setup the permissions
	access := LinkAccessProvider{
		AccessDriver: l.AccessDriver,
		LinkID:       link.LinkId,
	}

	l.Launch(link.CircuitId, logClock, userID, c, access)
}
