package conn

import "errors"

type MockRawConn struct {
	RecvData []byte
	SentData []byte

	FailRecv bool
	FailSend bool
}

func (rc *MockRawConn) Send(b []byte) error {
	if rc.FailSend {
		return errors.New("failed to send")
	}
	rc.SentData = b
	return nil
}

func (rc *MockRawConn) Recv() ([]byte, error) {
	if rc.FailRecv {
		return nil, errors.New("failed to recv")
	}
	return rc.RecvData, nil
}

func (rc *MockRawConn) Close() error {
	return nil
}

type MockConn struct {
	RecvData chan interface{}
	SentData chan interface{}

	FailRecv bool
	FailSend bool
}

func NewMockConn() *MockConn {
	return &MockConn{
		RecvData: make(chan interface{}, 1),
		SentData: make(chan interface{}, 1),
	}
}

func (rc *MockConn) Send(v interface{}) error {
	if rc.FailSend {
		return errors.New("failed to send")
	}
	rc.SentData <- v
	return nil
}

func (rc *MockConn) Recv() (interface{}, error) {
	if rc.FailRecv {
		return nil, errors.New("failed to recv")
	}
	for a := range rc.RecvData {
		return a, nil
	}
	return nil, errors.New("no data")
}

func (rc *MockConn) Close() error {
	return nil
}
