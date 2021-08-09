package conn

import (
	"errors"
	"testing"
)

type mockRawConn struct {
	recv []byte
	send []byte

	failRecv bool
	failSend bool
}

func (rc *mockRawConn) Send(b []byte) error {
	if rc.failSend {
		return errors.New("failed to send")
	}
	return nil
}

func (rc *mockRawConn) Recv() ([]byte, error) {
	if rc.failRecv {
		return nil, errors.New("failed to recv")
	}
	return rc.recv, nil
}

func (rc *mockRawConn) Close() error {
	return nil
}

func TestDefaultConnectionNormal(t *testing.T) {
	rc := &mockRawConn{}
	d := NewDefaultConnection(rc)

	rc.failRecv = false
	rc.recv = []byte(`
	{
		"kind": "propose",
		"Action": {
			"some_value": 1234
		},
		"ProposedClock": 1,
		"SchemaVersion": "3.0",
		"UserID": "TEST_USER"
	}
	`)

	ret, ok := <-d.Recv()
	if !ok {
		t.Error("failed to recv entry")
	}
	if _, ok := ret.(ProposeEntry); !ok {
		t.Error("recv'd wrong type")
	}
}

func TestDefaultConnectionClosedRecv(t *testing.T) {
	rc := &mockRawConn{}
	d := NewDefaultConnection(rc)

	rc.failRecv = true

	if _, ok := <-d.Recv(); ok {
		t.Error("expected closed channel")
	}
}

func TestDefaultConnectionBadFormat(t *testing.T) {
	rc := &mockRawConn{}
	d := NewDefaultConnection(rc)

	rc.failRecv = false
	rc.recv = []byte(`{ }`)

	if _, ok := <-d.Recv(); ok {
		t.Error("expected closed channel")
	}
}
