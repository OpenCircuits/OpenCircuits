package conn

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
