package conn

import (
	"testing"
	"time"
)

func TestDefaultConnectionNormal(t *testing.T) {
	rc := &MockRawConn{}
	d := RawConnectionWrapper{Raw: rc}

	rc.FailRecv = false
	rc.RecvData = []byte(`
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
	rc := &MockRawConn{}
	d := RawConnectionWrapper{Raw: rc}

	rc.FailRecv = false
	rc.RecvData = []byte(`{ }`)

	if _, err := d.Recv(); err == nil {
		t.Error("expected error")
	}
}

func mockupListener() (c *MockConn, p chan ProposeEntry, cl chan error, l Listener) {
	c = NewMockConn()
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

	c.RecvData <- ProposeEntry{}
	go l.Listen()
	close(c.RecvData)

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

	c.RecvData <- "AAAA"
	go l.Listen()
	close(c.RecvData)

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

	c.RecvData <- ProposeEntry{}
	go l.Listen()

	select {
	case e := <-cl:
		if e == nil {
			t.Error("expected non-nil error")
		}
	case <-time.After(time.Millisecond):
		t.Error("expected close from listener")
	}
}
