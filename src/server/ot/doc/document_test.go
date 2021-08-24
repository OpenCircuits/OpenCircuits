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

	respCh := make(chan interface{})
	sid := model.NewSessionID()

	// Send join message
	d.Send(MessageWrapper{
		Sender: sid,
		Data: JoinDocument{
			LogClock: 0,
			Chan:     MessageChan{respCh},
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
		Sender: sid,
		Data:   LeaveDocument{},
	})

	select {
	case <-ch:
	case <-respCh:
		t.Error("Received unexpected message after Leave")

	case <-time.After(time.Second):
		t.Error("Timed out: did not receive circuit closing message")
	}
}

func TestDocumentProposeSuccess(t *testing.T) {
	_, ds, _ := mockDoc()

	ch := make(chan interface{}, 1)
	ds.proposeEntry(ProposeEntry{
		ProposedClock: 1,
	}, model.NewSessionID(), MessageChan{ch})
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
	}, model.NewSessionID(), MessageChan{ch})
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

	type A struct {
		ch  chan interface{}
		sid model.SessionID
	}
	chans := make(map[string]A)
	for _, x := range []string{"A", "B", "C", "D"} {
		ch := make(chan interface{}, 1)
		sid := model.NewSessionID()
		chans[x] = A{ch: ch, sid: sid}
		ds.sessions[sid] = sessionInfo{
			JoinInfo: SessionJoined{},
			Chan:     MessageChan{ch},
		}
	}

	ch := chans["B"]
	ds.proposeEntry(ProposeEntry{
		ProposedClock: 2,
	}, ch.sid, MessageChan{ch.ch})
	res := <-ch.ch

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
			a := <-ch.ch
			if b, ok := a.(AcceptedEntry); ok {
				if b.AcceptedClock != 4 {
					t.Error("Received wrong log clock")
				}
			} else {
				t.Error("Received wrong update type")
			}
		} else {
			select {
			case <-ch.ch:
				t.Error("Expected no update on sender channel")
			default:
				break
			}
		}
	}
}
