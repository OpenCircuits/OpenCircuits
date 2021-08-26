package session

import (
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/ot"
)

func TestUpdatesCache(t *testing.T) {
	ch := make(chan bool, 10)
	c := UpdatesCache{
		OnUpdate: func() {
			ch <- true
		},
	}

	cb := c.PartialCallback()
	cb.NewEntry(ot.NewEntry{
		AcceptedClock: 5,
	})
	cb.SessionJoined(ot.SessionJoined{
		UserID: "HELLO",
	})
	cb.SessionLeft(ot.SessionLeft{})

	_, ok := <-ch
	if !ok {
		t.Fatal("expected update callback")
	}
	updates, ok := c.Pop()
	if !ok {
		t.Fatal("expected updates available")
	}
	if len(updates.NewEntries) != 1 {
		t.Error("expected new entry")
	} else if updates.NewEntries[0].AcceptedClock != 5 {
		t.Error("new entry had wrong accepted clock")
	}
	if len(updates.SessionsJoined) != 1 {
		t.Error("expected session joined")
	} else if updates.SessionsJoined[0].UserID != "HELLO" {
		t.Error("session join had wrong user ID")
	}
	if len(updates.SessionsLeft) != 1 {
		t.Error("expected session left")
	}

	select {
	case <-ch:
		t.Error("expected exactly one callback")
	default:
	}

	_, ok = c.Pop()
	if ok {
		t.Fatal("expected no updates after pop")
	}

	cb.SessionLeft(ot.SessionLeft{})
	<-ch
	c.Ack()

	_, ok = c.Pop()
	if ok {
		t.Fatal("expected no updates after ack")
	}
}
