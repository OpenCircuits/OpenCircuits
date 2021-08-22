package doc

import (
	"testing"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/drivers/mem"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

func memDrivers() DocumentDrivers {
	return DocumentDrivers{
		ChangelogDriver: mem.NewChangelogDriver(),
	}
}

func mockDoc() (Document, documentState, <-chan bool) {
	ch := make(chan bool, 10)
	a, b := newDocument(DocumentParam{model.NewCircuitID(), memDrivers(), func() { ch <- true }})
	smallChangelog(b)
	return a, b, ch
}

func smallChangelog(d documentState) {
	for i := range []int{0, 1, 2, 3} {
		acc, err := d.changelog.Accept(prop(uint64(i)))
		if err != nil {
			panic(err)
		}
		d.Drivers.ChangelogDriver.AppendChangelog(acc)
	}
}

func TestDocumentLifecycleSuccess(t *testing.T) {
	d, ds, ch := mockDoc()
	go ds.messageLoop()

	// Send join message
	respCh := make(chan interface{})
	d.Send(MessageWrapper{
		Resp: MessageChan{respCh},
		Data: JoinDocument{
			LogClock: 0,
		},
	})

	select {
	case resp := <-respCh:
		if m, ok := resp.(WelcomeMessage); ok {
			if len(m.MissedEntries) != 4 {
				t.Errorf("Expected welcome message of size 4 (received %d)\n", len(m.MissedEntries))
			}
		} else {
			t.Error("Received wrong message type")
		}

	case <-time.After(time.Second):
		t.Error("Timed out: did not receive welcome message")
	}

	// Send leave message
	d.Send(MessageWrapper{
		Resp: MessageChan{respCh},
		Data: LeaveDocument{},
	})

	select {
	case <-ch:
	case <-respCh:
		t.Error("Received unexpected message after Leave")

	case <-time.After(time.Second):
		t.Error("Timed out: did not receive circuit closing message")
	}
}

func TestDocumentLifecycleFailure(t *testing.T) {
	d, ds, ch := mockDoc()
	go ds.messageLoop()

	respCh := make(chan interface{})

	// Send propose message without a join message
	d.Send(MessageWrapper{
		Resp: MessageChan{respCh},
		Data: ProposeEntry{
			ProposedClock: 1,
		},
	})

	select {
	case <-ch:
	case cl := <-respCh:
		if _, ok := cl.(CloseMessage); !ok {
			t.Error("did not receive close message after bad propose")
		}

	case <-time.After(time.Second):
		t.Error("Timed out: did not receive close message")
	}
}

func TestDocumentProposeSuccess(t *testing.T) {
	_, ds, _ := mockDoc()

	ch := make(chan interface{}, 1)
	ds.proposeEntry(ProposeEntry{
		ProposedClock: 1,
	}, MessageChan{ch})
	res := <-ch

	if r, ok := res.(ProposeAck); ok {
		if r.AcceptedClock != 4 {
			t.Error("Received wrong log clock")
		}
	} else if r, ok := res.(CloseMessage); ok {
		t.Error("Document NACK'd when it shouldn't have: ", r.Reason)
	} else {
		t.Error("Bad return type: ", res)
	}
}

func TestDocumentProposeFailure(t *testing.T) {
	_, ds, _ := mockDoc()

	ch := make(chan interface{}, 1)
	ds.proposeEntry(ProposeEntry{
		ProposedClock: 10,
	}, MessageChan{ch})
	res := <-ch

	if r, ok := res.(ProposeAck); ok {
		t.Error("Document ACK'd when it shouldn't have: ", r.AcceptedClock)
	} else if _, ok := res.(CloseMessage); ok {
	} else {
		t.Error("Bad return type: ", res)
	}
}

func TestDocumentProposePropagate(t *testing.T) {
	_, ds, _ := mockDoc()

	chans := make(map[string]chan interface{})
	for _, x := range []string{"A", "B", "C", "D"} {
		ch := make(chan interface{}, 1)
		chans[x] = ch
		ds.sessions[MessageChan{ch}] = SessionJoined{}
	}

	ch := chans["B"]
	ds.proposeEntry(ProposeEntry{
		ProposedClock: 2,
	}, MessageChan{ch})
	res := <-ch

	if r, ok := res.(ProposeAck); ok {
		if r.AcceptedClock != 4 {
			t.Error("Received wrong log clock")
		}
	} else if r, ok := res.(CloseMessage); ok {
		t.Error("Document NACK'd when it shouldn't have: ", r.Reason)
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
