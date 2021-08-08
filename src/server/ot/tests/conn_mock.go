package tests

// MockConn is a mocked connection used for integration testing
type MockConn struct {
	recv chan interface{}
	send chan interface{}
}

func NewMockConn() MockConn {
	return MockConn{
		recv: make(chan interface{}, 10),
		send: make(chan interface{}, 10),
	}
}

// SetRecv puts messages into the connection
func (mc MockConn) SetRecv(s interface{}) {
	mc.recv <- s
}

// GetSend gets the next message sent to the connection
func (mc MockConn) GetSend() (interface{}, bool) {
	s, ok := <-mc.send
	return s, ok
}

func (mc MockConn) Recv() <-chan interface{} {
	return mc.recv
}

func (mc MockConn) Send(response interface{}) {
	mc.send <- response
}

func (mc MockConn) Close() {
	close(mc.recv)
	close(mc.send)
}
