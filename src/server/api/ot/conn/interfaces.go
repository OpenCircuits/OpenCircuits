package conn

// Connection is an abstract communication layer between sessions and clients
type Connection interface {
	Recv() ([]byte, error)
	Send([]byte) error
	Close() error
}
