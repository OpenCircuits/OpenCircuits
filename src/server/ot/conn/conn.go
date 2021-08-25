package conn

import (
	"errors"
	"fmt"
	"log"
	"reflect"
)

// RawConnection is an abstract raw data communication layer between sessions and clients
type RawConnection interface {
	// Recv is a blocking read call
	Recv() ([]byte, error)
	// Send is a non-blocking write call
	Send([]byte) error
	// Close closes the connection.
	Close() error
}

// Connection is an abstract communication layer between sessions and clients
//	that conforms to the protocol in "protocol.go"
type Connection interface {
	// Recv is block read call
	Recv() (interface{}, error)
	// Send is a non-blocking write call.  Write errors close the channel
	Send(s interface{}) error
	// Close closes the connection
	Close() error
}

// RawConnectionWrapper wraps a raw connection to the Connection interface
//	by using the protocol's serialize/deserialize method
type RawConnectionWrapper struct {
	Raw RawConnection
}

func (cw RawConnectionWrapper) Recv() (interface{}, error) {
	rawMsg, err := cw.Raw.Recv()
	if err != nil {
		return nil, err
	}
	return Deserialize(rawMsg)
}

func (cw RawConnectionWrapper) Send(s interface{}) error {
	rawMsg, err := Serialize(s)
	if err != nil {
		return err
	}
	return cw.Raw.Send(rawMsg)
}

func (cw RawConnectionWrapper) Close() error {
	return cw.Raw.Close()
}

// Listener is a wrapper around a Connection that implements the protocol
//	it provides a listener loop and uses provided callback functions for
//	event-driver behavior
type Listener struct {
	Conn      Connection
	OnPropose func(ProposeEntry)
	OnClose   func(err error)
}

func (l Listener) Listen() {
	defer func() {
		if r := recover(); r != nil {
			l.OnClose(errors.New(
				fmt.Sprint("listener goroutine panic'd: ", r),
			))
		}
	}()

	for {
		// This call can block (1)
		msg, err := l.Conn.Recv()
		if err != nil {
			l.OnClose(err)
			return
		}
		switch msg := msg.(type) {
		case ProposeEntry:
			l.OnPropose(msg)
		default:
			log.Println(
				"Listener received unexpected message type from client: ",
				reflect.TypeOf(msg).Name())
		}
	}
}
