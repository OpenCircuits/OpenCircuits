package conn

// Connection is an abstract communication layer between sessions and clients
type Connection interface {
	Recv() <-chan []byte
	Send([]byte)
	Close()
}
