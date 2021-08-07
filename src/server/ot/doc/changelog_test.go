package doc

import (
	"errors"
	"fmt"
	"testing"
)

func TestChangelogAddMultiple(t *testing.T) {
	l := Changelog{}
	type Want struct {
		id  uint64
		err error
	}
	tests := []struct {
		p    ProposedEntry
		want Want
	}{
		{ProposedEntry{[]byte{}, 0, "", "TEST0", "ASDF"}, Want{0, nil}},
		{ProposedEntry{[]byte{}, 1, "", "TEST0", "ASDF"}, Want{1, nil}},
		{ProposedEntry{[]byte{}, 3, "", "TEST0", "ASDF"}, Want{0, errors.New("")}},
		{ProposedEntry{[]byte{}, 0, "", "TEST0", "ASDF"}, Want{2, nil}},
	}

	for _, tt := range tests {
		testname := fmt.Sprintf("%d", tt.p.ProposedClock)
		t.Run(testname, func(t *testing.T) {
			ans, err := l.AddEntry(tt.p)
			if (err != nil) != (tt.want.err != nil) {
				t.Errorf("got %d, want %d", err, tt.want.err)
			} else if ans.AcceptedClock != tt.want.id {
				t.Errorf("got %d, want %d", ans.AcceptedClock, tt.want.id)
			}
		})
	}
}

func smallChangelog() Changelog {
	l := Changelog{}
	l.AddEntry(ProposedEntry{[]byte{}, 0, "", "", ""})
	l.AddEntry(ProposedEntry{[]byte{}, 1, "", "", ""})
	l.AddEntry(ProposedEntry{[]byte{}, 2, "", "", ""})
	l.AddEntry(ProposedEntry{[]byte{}, 3, "", "", ""})

	return l
}

func TestChangelogSlice(t *testing.T) {
	l := smallChangelog()
	res := l.Slice(2)
	if len(res) != 2 {
		t.Errorf("got slice of length %d, want %d", len(res), 2)
	}
}

func TestChangelogRange(t *testing.T) {
	l := smallChangelog()
	res := l.Range(1, 3)
	if len(res) != 2 {
		t.Errorf("got slice of length %d, want %d", len(res), 2)
	} else if res[0].AcceptedClock != 1 {
		t.Errorf("slice started at %d, want %d", res[0].AcceptedClock, 1)
	}
}
