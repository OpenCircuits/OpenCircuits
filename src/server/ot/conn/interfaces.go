package conn

// RawConnection is an abstract data communication layer between sessions and clients
type RawConnection interface {
	// Recv is a blocking read call
	Recv() ([]byte, error)
	// Send is a non-blocking write call
	Send([]byte) error
	// Close closes the connection.  Subsequent Send calls are undefined.  Subsequent Recv calls are errors
	Close() error
}

// RawConnection is an abstract communication layer between sessions and clients
type Connection interface {
	// Recv is a channel to receive protocol types on.  Read errors close the channel
	Recv() <-chan interface{}
	// Send is a non-blocking write call.  Write errors close the channel
	Send(s interface{})
	// Close closes the connection.  All subsequent Recv/Send calls are undefined
	Close()
}
