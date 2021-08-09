package conn

import "log"

// NewDefaultConnection creates a new connection with the default protocol and serialization
func NewDefaultConnection(raw RawConnection) Connection {
	dc := defaultConnection{
		raw:  raw,
		recv: make(chan interface{}),
	}
	go dc.listener()
	return dc
}

type defaultConnection struct {
	raw  RawConnection
	recv chan interface{}
}

func (dc defaultConnection) listener() {
	defer dc.Close()
	for {
		rawMsg, err := dc.raw.Recv()
		if err != nil {
			// Assume this means dc.raw is closed
			break
		}

		s, err := Deserialize(rawMsg)
		if err != nil {
			log.Println("client sent a bad message: ", err)
			break
		}
		dc.recv <- s
	}
}

func (dc defaultConnection) Recv() <-chan interface{} {
	return dc.recv
}

func (dc defaultConnection) Send(s interface{}) {
	rawMsg, err := Serialize(s)
	if err != nil {
		log.Print("default connection failed to serialize message:", err)
		dc.Close()
		return
	}
	if err := dc.raw.Send(rawMsg); err != nil {
		log.Print("default connection failed to send message:", err)
		dc.Close()
	}
}

func (dc defaultConnection) Close() {
	close(dc.recv)
	_ = dc.raw.Close()
}
