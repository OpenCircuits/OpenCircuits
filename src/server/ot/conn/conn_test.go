package conn

import (
	"errors"
	"testing"
	"time"
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
	rc.send = b
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
	d := RawConnectionWrapper{Raw: rc}

	rc.failRecv = false
	rc.recv = []byte(`
	{
		"Type": "ProposeEntry",
		"Msg": {
			"Action": {
				"some_value": 1234
			},
			"ProposedClock": 1,
			"SchemaVersion": "3.0",
			"UserID": "TEST_USER"
		}
	}
	`)

	ret, err := d.Recv()
	if err != nil {
		t.Error("failed to recv entry")
	}
	if _, ok := ret.(ProposeEntry); !ok {
		t.Error("received wrong type")
	}
}

func TestDefaultConnectionBadRecvFormat(t *testing.T) {
	rc := &mockRawConn{}
	d := RawConnectionWrapper{Raw: rc}

	rc.failRecv = false
	rc.recv = []byte(`{ }`)

	if _, err := d.Recv(); err == nil {
		t.Error("expected error")
	}
}

type mockConn struct {
	recv interface{}
	send interface{}

	failRecv bool
	failSend bool
}

func (rc *mockConn) Send(v interface{}) error {
	if rc.failSend {
		return errors.New("failed to send")
	}
	rc.send = v
	return nil
}

func (rc *mockConn) Recv() (interface{}, error) {
	if rc.failRecv {
		return nil, errors.New("failed to recv")
	}
	return rc.recv, nil
}

func (rc *mockConn) Close() error {
	return nil
}

func mockupListener() (c *mockConn, p chan ProposeEntry, cl chan error, l Listener) {
	c = &mockConn{}
	p = make(chan ProposeEntry)
	cl = make(chan error, 10)
	l = Listener{
		Conn: c,
		OnPropose: func(pe ProposeEntry) {
			p <- pe
		},
		OnClose: func(e error) {
			cl <- e
		},
	}
	return
}

func TestListenerNormalLifecycle(t *testing.T) {
	c, p, cl, l := mockupListener()

	c.recv = ProposeEntry{}
	go l.Listen()
	<-time.After(time.Millisecond)
	c.failRecv = true

	select {
	case <-p:
	case <-time.After(time.Millisecond):
		t.Error("expected proposal from listener")
	}

	select {
	case <-cl:
	case <-time.After(time.Millisecond):
		t.Error("expected close from listener")
	}
}

func TestListenerBadClient(t *testing.T) {
	c, p, cl, l := mockupListener()

	c.recv = "AAAA"
	go l.Listen()
	<-time.After(time.Millisecond)
	c.failRecv = true

	select {
	case <-p:
		t.Error("unexpected proposal from listener")
	default:
	}

	select {
	case <-cl:
	case <-time.After(time.Millisecond):
		t.Error("expected close from listener")
	}
}

func TestListenerBadPropose(t *testing.T) {
	c, _, cl, l := mockupListener()

	l.OnPropose = func(ProposeEntry) { panic("BAD PROPOSE") }

	c.recv = ProposeEntry{}
	go l.Listen()
	<-time.After(time.Millisecond)

	select {
	case e := <-cl:
		if e == nil {
			t.Error("expected non-nil error")
		}
	case <-time.After(time.Millisecond):
		t.Error("expected close from listener")
	}
}
