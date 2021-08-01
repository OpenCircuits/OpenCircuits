package doc

import (
	"testing"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

func TestDocumentLifecycleSuccess(t *testing.T) {
	ch := make(chan model.CircuitId)
	d, ds := newDocument("AAAA", ch)
	go ds.messageLoop()
	*ds.log = smallChangelog()

	// Send join message
	respCh := make(chan interface{})
	d.Send(MessageWrapper{
		SessionID: "BBBB",
		Resp:      respCh,
		Data: JoinDocument{
			LogClock: 0,
		},
	})

	select {
	case resp := <-respCh:
		if m, ok := resp.(WelcomeMessage); ok {
			if len(m.MissedEntries) != 4 {
				t.Error("Expected welcome message of size 4")
			}
		} else {
			t.Error("Received wrong message type")
		}

	case <-time.After(time.Second):
		t.Error("Timed out: did not receive welcome message")
	}

	// Send leave message
	d.Send(MessageWrapper{
		SessionID: "BBBB",
		Resp:      respCh,
		Data:      LeaveDocument{},
	})

	select {
	case <-respCh:
		t.Error("Received unexpected message after Leave")

	case id := <-ch:
		if id != "AAAA" {
			t.Error("Received wrong circuit ID when closing")
		}

	case <-time.After(time.Second):
		t.Error("Timed out: did not receive circuit closing message")
	}
}

func mkDocState() docState {
	ch := make(chan model.CircuitId)
	_, ds := newDocument("AAAA", ch)
	*ds.log = smallChangelog()
	return ds
}

func TestDocumentProposeSuccess(t *testing.T) {
	ds := mkDocState()
	res := ds.serverRecv(Propose{
		ProposedClock: 1,
	})
	if r, ok := res.(ProposeAck); ok {
		if r.AcceptedClock != 4 {
			t.Error("Received wrong log clock")
		}
	} else if r, ok := res.(ProposeNack); ok {
		t.Error("Document NACK'd when it shouldn't have: ", r.ErrorMsg)
	} else {
		t.Error("Bad return type: ", res)
	}
}

func TestDocumentProposeFailure(t *testing.T) {
	ds := mkDocState()
	res := ds.serverRecv(Propose{
		ProposedClock: 10,
	})
	if r, ok := res.(ProposeAck); ok {
		t.Error("Document ACK'd when it shouldn't have: ", r.AcceptedClock)
	} else if _, ok := res.(ProposeNack); ok {
	} else {
		t.Error("Bad return type: ", res)
	}
}

func TestDocumentProposePropagate(t *testing.T) {
	ds := mkDocState()

	chans := make(map[string]<-chan interface{})
	for _, x := range []string{"A", "B", "C", "D"} {
		ch := make(chan interface{}, 1)
		chans[x] = ch
		ds.clients[x] = ch
	}

	res := ds.serverRecv(Propose{
		ProposedClock: 2,
		SessionID:     "B",
	})

	if r, ok := res.(ProposeAck); ok {
		if r.AcceptedClock != 4 {
			t.Error("Received wrong log clock")
		}
	} else if r, ok := res.(ProposeNack); ok {
		t.Error("Document NACK'd when it shouldn't have: ", r.ErrorMsg)
	} else {
		t.Error("Bad return type: ", res)
	}

	for s, ch := range chans {
		if s != "B" {
			a := <-ch
			if b, ok := a.(AcceptedEntry); ok {
				if b.AcceptedClock != 4 {
					t.Error("Received wrong log clock")
				}
			} else {
				t.Error("Received wrong update type")
			}
		} else {
			select {
			case <-ch:
				t.Error("Expected no update on sender channel")
			default:
				break
			}
		}
	}
}
