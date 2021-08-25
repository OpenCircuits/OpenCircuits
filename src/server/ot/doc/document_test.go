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

func mockDoc() (*Document, <-chan bool) {
	ch := make(chan bool, 10)
	d := NewDocument(DocumentParam{model.NewCircuitID(), memDrivers(), func() { ch <- true }})
	smallChangelog(d)
	return d, ch
}

func smallChangelog(d *Document) {
	for i := range []int{0, 1, 2, 3} {
		acc, err := d.changelog.Accept(prop(uint64(i)))
		if err != nil {
			panic(err)
		}
		d.Drivers.ChangelogDriver.AppendChangelog(acc)
	}
}

type sessionHandle struct {
	h SessionHandle

	newEntry      <-chan NewEntry
	sessionJoined <-chan SessionJoined
	sessionLeft   <-chan SessionLeft
	closed        <-chan bool
}

func mockSessionHandle(sid model.SessionID, userID model.UserID) sessionHandle {
	a := make(chan NewEntry, 10)
	b := make(chan SessionJoined, 10)
	c := make(chan SessionLeft, 10)
	d := make(chan bool, 10)
	return sessionHandle{
		h: SessionHandle{
			NewEntry: func(ne NewEntry) {
				a <- ne
			},
			SessionJoined: func(sj SessionJoined) {
				b <- sj
			},
			SessionLeft: func(sl SessionLeft) {
				c <- sl
			},
			Close: func() {
				d <- true
			},
			Info: SessionInfo{
				SessionJoined: SessionJoined{
					SessionID: sid,
					UserID:    userID,
				},
			},
		},
		newEntry:      a,
		sessionJoined: b,
		sessionLeft:   c,
		closed:        d,
	}
}

func TestDocumentLifecycleSuccess(t *testing.T) {
	d, ch := mockDoc()

	sid := model.NewSessionID()

	// Send join message
	w, err := d.Join(JoinDocument{
		LogClock: 0,
		Session:  mockSessionHandle(sid, "").h,
	})
	if err != nil {
		t.Error("unexpected error: ", err)
	}
	if len(w.MissedEntries) != 4 {
		t.Errorf("Expected welcome message of size 4 (received %d)\n", len(w.MissedEntries))
	}

	// Send leave message
	d.Leave(sid)

	select {
	case <-ch:
	case <-time.After(time.Second):
		t.Error("Timed out: did not receive circuit closing message")
	}
}

func checkPropose(t *testing.T, err error) {
	if err != nil {
		switch err := err.(type) {
		case ProposeNackError:
			t.Error("Document NACK'd when it shouldn't have: ", err)
		default:
			t.Error("unexpected error: ", err)
		}
	}
}

func TestDocumentProposeSuccess(t *testing.T) {
	d, _ := mockDoc()

	sid := model.NewSessionID()

	ack, err := d.Propose(ProposeEntry{
		ProposedClock: 1,
		SessionID:     sid,
	})
	checkPropose(t, err)
	if ack.AcceptedClock != 4 {
		t.Error("Received wrong log clock")
	}
}

func TestDocumentProposeFailure(t *testing.T) {
	d, _ := mockDoc()

	ack, err := d.Propose(ProposeEntry{
		ProposedClock: 10,
	})
	if err == nil {
		t.Error("Document ACK'd when it shouldn't have: ", ack.AcceptedClock)
	}
	switch err := err.(type) {
	case ProposeNackError:
	default:
		t.Error("unexpected error: ", err)
	}
}

func TestDocumentProposePropagate(t *testing.T) {
	d, _ := mockDoc()

	sessions := make(map[string]sessionHandle)
	for _, x := range []string{"A", "B", "C", "D"} {
		sid := model.NewSessionID()
		sh := mockSessionHandle(sid, model.UserID(x))
		d.sessions[sid] = sh.h
		sessions[x] = sh
	}

	_, err := d.Propose(ProposeEntry{
		ProposedClock: 2,
		SessionID:     sessions["B"].h.Info.SessionID,
	})
	checkPropose(t, err)

	for n, s := range sessions {
		if n != "B" {
			select {
			case a := <-s.newEntry:
				if a.AcceptedClock != 4 {
					t.Error("Received wrong log clock")
				}
			case <-s.sessionJoined:
				t.Error("unexpected join")
			case <-s.sessionLeft:
				t.Error("unexpected leave")
			case <-s.closed:
				t.Error("unexpected close")
			}
		} else {
			select {
			case <-s.newEntry:
				t.Error("unexpected new entry")
			case <-s.sessionJoined:
				t.Error("unexpected join")
			case <-s.sessionLeft:
				t.Error("unexpected leave")
			case <-s.closed:
				t.Error("unexpected close")
			default:
				break
			}
		}
	}
}
